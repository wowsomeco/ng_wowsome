import { Input, OnDestroy, Component, ContentChild, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatFormFieldControl, MatFormField } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { randomId } from 'src/ng_wowsome/scripts/utils';
import { NgControl } from '@angular/forms';

/**
 * The base class of the Material FormControl.
 * Extend this class to create your own FormControl accordingly to avoid defining all the MatFormFieldControl properties.
 * for more details, https://material.angular.io/guide/creating-a-custom-form-field-control
 */
@Component({
  template: '',
  providers: [{ provide: MatFormFieldControl, useExisting: FormControlComponent }],
})
export abstract class FormControlComponent<T> implements OnDestroy, MatFormFieldControl<T> {
  @Input() id: string = randomId();

  @Input()
  get placeholder() { return this._placeholder; }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  private _placeholder: string;

  @Input()
  get required() { return this._required; }
  set required(req) {
    this._required = req;
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get value(): T | null { return this._value; }
  set value(s: T | null) {
    this._value = s;
    this.stateChanges.next();
  }
  private _value: T;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = value;
    this.stateChanges.next();
  }
  private _disabled = false;

  get shouldLabelFloat() { return this.focused || !this.empty; }
  get empty() { return !this.value; }

  focused = false;
  errorState = false;
  stateChanges = new Subject<void>();
  describedBy = '';

  ngControl: NgControl = null;

  onContainerClick(_: MouseEvent) { }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }
}

/**
 * The wrapper for the <mat-form-field> to simplify the tag definition in forms of props.
 * e.g. you dont need to define <mat-hint> and just do <w-field hint="the hint" /> instead
 */
@Component({
  selector: 'w-field',
  templateUrl: './form-field.component.html'
})
export class FieldComponent implements AfterViewInit {
  @Input() label: string;

  @Input() hint: string;

  /** the loading spinner that shows on the suffix slot of the <mat-form-field>  */
  @Input() loading: boolean;

  @ContentChild(MatFormFieldControl) private _control: MatFormFieldControl<any>;

  @ViewChild(MatFormField) private _matFormField: MatFormField;

  constructor(private _cdr: ChangeDetectorRef) { }

  ngAfterViewInit() {
    // need to do this because of the mat-form-field limitation that can have input control in ng-content
    // e.g. https://github.com/angular/components/issues/9411
    this._matFormField._control = this._control;
    this._cdr.detectChanges();
  }
}

/**
 * The Form Field component.
 * Ideally this component consists directly inside the FormComponent and supply the key.
 * to get evaluated later by the FormComponent accordingly.
 * see FormFieldComponent for more details about how to use this.
 */
@Component({
  selector: 'w-form-field',
  template: `
  <ng-content></ng-content>
  <p *ngIf="error" class="t-text-red-500 t-text-xs">{{error}}</p>
  `
})
export class FormFieldComponent {
  /** supply this key with the same name as the RestModel variable. */
  @Input() key: string = randomId();

  /** The error message that shows on submit whenever the value that gets evaluated by FormComponent is still invalid. */
  @Input()
  get error(): string { return this._error; }
  set error(v: string) {
    this._error = v;
  }
  private _error: string;
}
