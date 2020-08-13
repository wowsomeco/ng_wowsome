import { Component, Input } from '@angular/core';

/**
 * Overlay component.
 */
@Component({
  template: `
  <div [style.z-index]="9999" *ngIf="show" class="t-absolute t-w-full t-h-full t-top-0 t-left-0" [style.background-color]="bgColor" wOn="click.stop">
    <ng-content></ng-content>
    <div class="t-flex t-justify-center t-items-center t-h-full">
      <ng-content select="[slot=center]"></ng-content>
    </div>
  </div>
  `,
  selector: 'w-overlay'
})
export class OverlayComponent {
  @Input() show: boolean;

  /** The BG Color in Hex */
  @Input() color = '#ecf0f1';

  /** The opacity of the BG */
  @Input() opacity = 0.1;

  get bgColor(): string {
    const rgb = this._hexToRgb(this.color);
    const rgba = `rgba(${[rgb.r, rgb.g, rgb.b].join(',')},${this.opacity})`;
    return rgba;
  }

  _hexToRgb(hex: string): Record<string, number> | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
