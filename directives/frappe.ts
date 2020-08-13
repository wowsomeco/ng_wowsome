import { Directive, Input, ElementRef, OnChanges } from '@angular/core';
import { Chart } from 'frappe-charts/dist/frappe-charts.esm.js';

export interface FrappeData {
  labels: string[];
  datasets: Record<string, any>[];
}

@Directive({
  selector: '[wFrappe]'
})
export class FrappeDirective implements OnChanges {
  @Input() frTitle: string;
  @Input() frData: FrappeData;
  /** axis-mixed | bar | line | scatter | pie | percentage */
  @Input() frType = 'bar';
  @Input() frHeight = 350;

  constructor(private _el: ElementRef) { }

  ngOnChanges() {
    if (!this.frData) { return; }

    const _ = new Chart(this._el.nativeElement, {
      title: this.frTitle,
      data: this.frData,
      type: this.frType,
      height: this.frHeight
    });
  }
}
