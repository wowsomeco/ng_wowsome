import * as JSZip from 'jszip';
import { Buffer } from 'buffer';
import { Feature, FeatureCollection } from '@turf/helpers';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LeafletDialogComponent } from '../dialog/dialog.component';
import { FormControlComponent } from '../forms/form-field.component';
import { getFileExtension, keyWhere, keyIgnoreCase, luasArea, propertyAt } from 'src/ng_wowsome/scripts/utils';

/**
 * Uploads spatial data and outputs it as an array of Feature on success.
 * Right now it's only able to convert .zip that consists of .shp, .dbf, and .prj.
 * Use this to input polygon string from the database
 *
 * TODO: allow geojson file too.
 */
@Component({
  selector: 'w-spatial-field',
  templateUrl: './spatial-field.component.html',
})
export class SpatialFieldComponent extends FormControlComponent<Feature[]> {
  @Input() label: string;

  @Output() valueChange = new EventEmitter<Feature[]>();

  @Input() totalArea: number;

  @Output() totalAreaChange = new EventEmitter<number>();

  /**
   * Property Key filter in the feature properties.
   * If defined, then this will be used to generate the [[summary]]
   */
  @Input() propertyKey: string;

  loading = false;
  summary: string[] = [];

  get selectedFile(): File { return this._selectedFile; }
  set selectedFile(f: File) {
    this._selectedFile = f;
    this.onFileSelected(f);
  }
  private _selectedFile: File;

  constructor(public dialog: MatDialog) { super(); }

  removeSummary(idx: number) {
    this.summary.splice(idx, 1);
    // update according to the selected summary
    const features: Feature[] = [];
    for (const f of this.value) {
      let shouldAdd = true;
      // find the key, ignore case
      const key: string = keyIgnoreCase(f.properties, this.propertyKey);
      if (key && !this.summary.includes(f.properties[key])) {
        shouldAdd = false;
      }
      // add only if it should
      if (shouldAdd) { features.push(f); }
    }
    // update the changes
    this.valueChange.emit(features);
    this.totalAreaChange.emit(luasArea(features));
  }

  openDialog() {
    this.dialog.open(LeafletDialogComponent, {
      width: '95vw',
      height: '80vh',
      data: { features: [this.value] }
    });
  }

  async onFileSelected(file: File) {
    if (!file) { return; }

    // can only process .zip consists of .shp, .dbf, and .prj for now
    // might want to be able to process .geojson too eventually.
    switch (getFileExtension(file.name)) {
      case 'zip':
        this.loading = true;
        try {
          const r = await new JSZip().loadAsync(file);
          await this._parseFiles(r.files);
          this.loading = false;
        } catch (err) {
          this.loading = false;
        }
        break;
      default:
        alert('Hanya bisa memproses file dengan ekstensi .zip');
        break;
    }
  }

  private async _getArrayBuffer(zipFiles: Record<string, JSZip.JSZipObject>, filename: string): Promise<ArrayBuffer> {
    return await zipFiles[keyWhere(zipFiles, filename)].async('arraybuffer');
  }

  private async _parseFiles(zipFiles: Record<string, JSZip.JSZipObject>): Promise<any> {
    try {
      // get array buffers for each shp, prj, dbf files.
      const shp = require('shpjs');
      const shpBuffer = await this._getArrayBuffer(zipFiles, 'shp');
      const prjBuffer = await this._getArrayBuffer(zipFiles, 'prj');
      const dbfBuffer = await this._getArrayBuffer(zipFiles, 'dbf');
      // combine them to get a geojson object in a form of FeatureCollection.
      const result: FeatureCollection = shp.combine([shp.parseShp(shpBuffer, Buffer.from(prjBuffer)), shp.parseDbf(dbfBuffer)]);
      // iterate over for each features, calculate the total area in Hectare,
      // the combine it to the properties object
      this.summary = [];
      const features: Feature[] = [];
      for (const f of result.features) {
        const ft = Object.assign({}, f);
        // delete all bbox as we don't really need it, for now
        delete ft.bbox;
        delete ft.geometry.bbox;
        features.push(ft);
        // find the key according to propertyKey given
        const key: string = keyIgnoreCase(f.properties, this.propertyKey);
        const prop = key ? f.properties[key] : propertyAt(f.properties, 0);
        // add to summary if doesnt exist yet
        if (!this.summary.includes(prop)) { this.summary.push(prop); }
      }
      // emit the changes
      this.valueChange.emit(features);
      this.totalAreaChange.emit(luasArea(features));
    } catch (err) {
      alert(err);
      throw new Error(err);
    }
  }
}
