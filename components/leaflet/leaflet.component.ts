import L from 'leaflet';
import 'style-loader!leaflet/dist/leaflet.css';
import 'style-loader!leaflet/dist/images/marker-icon-2x.png';
import 'style-loader!leaflet/dist/images/marker-icon.png';
import 'style-loader!leaflet/dist/images/marker-shadow.png';

import { Component, Input, AfterViewInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Feature } from '@turf/helpers';
import { randomId } from 'src/ng_wowsome/scripts/utils';
import { Subject } from 'rxjs';

interface TileLayerOption {
  id: string;
  name: string;
}

interface LayerToggle {
  selected: boolean;
}

export interface StyleOption {
  stroke?: boolean;
  color?: string;
  weight?: number;
  opacity?: number;
  fillColor?: string;
  fillOpacity?: number;
}

export interface StyleProvider {
  /**
   * callback that gets called to provide style option for each feature on the map.
   * @param f the feature item of [[features]]
   * @returns StyleOption that defines the geometry style on the map.
   */
  getFeatureStyle: (f: Feature) => StyleOption;
}

export abstract class LeafletService {
  abstract get styleProviders(): StyleProvider[];
}

/**
 * The Leaflet map component.
 * It can render an array of features that might consist of different geometries
 * e.g. point, polygon, multi polygon, etc.
 *
 * <font color='red'>It's still very much WIP for now and might get revamped for flexibility eventually.</font>
 */
@Component({
  selector: 'w-leaflet',
  templateUrl: './leaflet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeafletComponent implements AfterViewInit, OnChanges {
  /**
   * The height of the map
   */
  @Input() height = '80vh';

  /**
   * The GeoJSON Layer.
   * e.g.
   * ```typescript
   * [
   * [
   *  {
   *    type: "Feature",
   *    properties: {},
   *    geometry: {
   *      type: "Polygon",
   *      coordinates: [[
   *        [-104.05, 48.99],[-97.22,  48.98]
   *      ]]
   *    }
   *  },
   *  ...
   * ],
   * ...
   * ]
   * ```
   */
  @Input() features: Array<Feature[]> = [];

  /**
   * Callback for each the feature getting rendered by Leaflet.
   * e.g.
   * ```typescript
   * (feature, layer) => {
   *  let props = '';
   *  for (const k in feature.properties) {
   *   if (feature.properties[k]) {
   *     const title = k;
   *     props += `
   *     <div class="t-flex t-flex-col t-mb-1">
   *       <span class="t-font-bold">${title}</span>
   *       <span class="t-text-blue-500">${feature.properties[k]}</span>
   *     </div>`;
   *   }
   *  }
   *  layer.bindPopup(props);
   * }
   * ```
   */
  @Input() onEachFeature: (f: Feature, layer /*: Layer*/) => void;

  /**
   * The clear observable.
   * if set, then whenever the clear event gets triggered from the parent, it will clear the current existing layers.
   */
  @Input() clear: Subject<void>;

  // might want to define this in LeafletService later so that it's customizable by the caller
  tileLayerOptions: TileLayerOption[] = [
    { id: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', name: 'OpenStreetMap' },
    { id: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png', name: 'CartoDB' },
    { id: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', name: 'OpenTopo' }
  ];

  tileLayerSelected = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  /** the id of the map, needs to be random so that we can have multiple maps on the same page */
  mapId: string = randomId();
  openSettings = false;
  toggleLayers: LayerToggle[] = [];

  private _map;
  private _mapTileLayer;
  private _layers = [];

  constructor(private _service: LeafletService, private _cdr: ChangeDetectorRef) { }

  toggleLayer(idx: number): void {
    const flag = !this.toggleLayers[idx].selected;
    this.toggleLayers[idx].selected = flag;

    const layer = this._layers[idx];
    flag ? layer.addTo(this._map) : this._map.removeLayer(layer);
  }

  clearLayer(): void {
    this._layers.forEach(l => this._map.removeLayer(l));
    this._layers = [];
    this.toggleLayers = [];
  }

  changeTileLayer(l: string): void {
    this.tileLayerSelected = l;
    this.setTileLayer();
  }

  setTileLayer(): void {
    // remove prev tile layer
    if (this._mapTileLayer) {
      this._map.removeLayer(this._mapTileLayer);
    }
    // set the tile layer based on the selected dropdown tileLayer item
    this._mapTileLayer = L.tileLayer(this.tileLayerSelected, {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this._map);
  }

  newFeatures(): void {
    // clear polygon first
    this.clearLayer();
    // bail if features array is empty
    if (!this.features || this.features.length === 0) { return; }
    // render the features
    this.features.forEach(features => {
      const p = L.geoJSON(features, {
        onEachFeature: (feature, layer) => {
          this.onEachFeature?.(feature, layer);
        },
        style: f => {
          if (!this._service.styleProviders) { return undefined; }
          let s: StyleOption;
          for (const sp of this._service.styleProviders) {
            s = sp.getFeatureStyle?.(f);
            if (s) { break; }
          }
          return s;
        }
      }).addTo(this._map);
      // add to polygon layer
      this._layers.push(p);
      this.toggleLayers.push({ selected: true });
      // zoom in on the polygon
      this._map.invalidateSize();
      this._map.fitBounds(p.getBounds(), { maxZoom: 10 });
    });
  }

  ngAfterViewInit(): void {
    this._map = L.map(this.mapId, {
      center: [0, 115.9213],
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true,
      fullscreenControl: true
    });
    // on start drag map, hide settings window
    this._map.on('dragstart', _ => this.openSettings = false);

    this.setTileLayer();
    this.newFeatures();
    // observe clear ev on init.
    if (this.clear) { this.clear.subscribe(() => this.clearLayer()); }
  }

  ngOnChanges(_: SimpleChanges): void {
    if (this._map) { this.newFeatures(); }
  }
}
