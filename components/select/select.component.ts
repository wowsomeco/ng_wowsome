import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Acts as a Dropdown.
 * This component is a wrapper around <mat-select>
 */
@Component({
  selector: 'w-select',
  templateUrl: './select.component.html',
})
export class SelectComponent {
  @Input() label: string;

  @Input() placeholder: string;

  @Input() idKey = 'id';

  @Input() valueKey = 'name';

  @Input() loading = false;

  /**
   * The select options.
   *
   * e.g.
   * ```typescript
   * [
   *  { id: 1, name: "Option 1" },
   *  ...
   * ]
   * ```
   */
  @Input() options: Record<string, number | string>[];

  @Input() value: number | string;

  @Output() valueChange = new EventEmitter();

  valueChanged(v: number | string) {
    this.valueChange.emit(v);
  }
}
