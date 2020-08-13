import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import * as dayjs from 'dayjs';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';

/**
 * Mat Datepicker wrapper component.
 */
@Component({
  selector: 'w-datepicker',
  template: `
  <w-field [label]="label">
    <input readonly matInput [matDatepicker]="dp" (dateChange)="changeValue($event)" [formControl]="control">
    <mat-datepicker-toggle slot="suffix" [for]="dp"></mat-datepicker-toggle>
    <mat-datepicker #dp></mat-datepicker>
  </w-field>
  `
})
export class DatepickerComponent implements OnChanges {
  @Input() label: string;

  @Input() valueFormat = 'YYYY-MM-DDTHH:mm:ssZ';

  @Input() value: string;

  @Output() valueChange = new EventEmitter<string>();

  control: FormControl;

  changeValue(event: MatDatepickerInputEvent<Date>) {
    this.valueChange.emit(dayjs(event.value).format(this.valueFormat));
  }

  ngOnChanges(_) {
    this.control = new FormControl(new Date(this.value));
  }
}
