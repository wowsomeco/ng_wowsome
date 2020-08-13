import { Component, Output, EventEmitter, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import * as dayjs from 'dayjs';

abstract class BasePickerComponent {
  @Input() label: string;

  @Input() placeholder: string;

  @Input() value: number;

  @Output() valueChange = new EventEmitter<number>();

  changeValue(v: number): void { this.valueChange.emit(v); }
}

function selectTemplate(options: string, valueKey: string = 'name'): string {
  return `
  <w-select [label]="label" valueKey="${valueKey}" [placeholder]="placeholder" [options]="${options}" [value]="value" (valueChange)="changeValue($event)">
  </w-select>
  `;
}

/**
 * Month Picker.
 */
@Component({
  template: selectTemplate('months'),
  selector: 'w-month-picker',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonthPickerComponent extends BasePickerComponent {
  months = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'December' },
  ];
}

/**
 * Year Picker.
 */
@Component({
  template: selectTemplate('years', 'id'),
  selector: 'w-year-picker',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YearPickerComponent extends BasePickerComponent implements OnChanges {
  @Input() fromYear = 1980;

  @Input() toYear: number = dayjs().year();

  years: Record<string, number>[] = [];

  ngOnChanges(_): void {
    this.years = [];
    for (let i = this.toYear; i > this.fromYear; i--) {
      this.years.push({ id: i });
    }
  }
}
