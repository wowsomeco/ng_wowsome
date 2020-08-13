import { Input, Component, QueryList, ContentChildren, Output, EventEmitter, OnInit } from '@angular/core';
import { RestModel } from '@scripts/models';
import { validate, ValidationError } from 'class-validator';
import { FormFieldComponent } from './form-field.component';
import { ApiService, ApiResponse } from '@services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

abstract class BaseForm {
  /** the form model, required */
  @Input() model: RestModel;
  @Input() btnWidth = '100%';
  @ContentChildren(FormFieldComponent, { descendants: true }) protected _fields: QueryList<FormFieldComponent>;

  async validateForm(): Promise<boolean> {
    // clear errs first
    this._fields.forEach(f => f.error = undefined);
    // check if any errs
    const errs: ValidationError[] = await validate(this.model);
    if (errs.length === 0) {
      // do submit
      return true;
    } else {
      // get the first error and check whether there is any field exist with key equals to the property of the model variable.
      const firstError = errs[0];
      const field: FormFieldComponent = this._fields.find(x => x.key === firstError.property);
      // if field found, show the err
      if (field) { field.error = Object.values(firstError.constraints)[0]; }
      return false;
    }
  }
}

/**
 * Basic Form Component.
 *
 * Use this to build a simple form that doesnt handle Insert or Update operations
 * e.g. Login Form, etc.
 */
@Component({
  selector: 'w-basic-form',
  templateUrl: './form.component.html'
})
export class BasicFormComponent extends BaseForm {
  @Input() submitBtnLabel = 'Submit';

  @Input() loading: boolean;

  @Output() doSubmit = new EventEmitter();

  async submit() {
    const valid = await this.validateForm();
    if (valid) { this.doSubmit.emit(); }
  }
}

/**
 * Form Component.
 *
 * Ideally, It consists of one or many FormFieldComponent
 * Everytime the submit button gets clicked, it will check the [[model]]
 * and then evaluate the validator defined as decorator.
 * if there are still validation error(s), it shows the [[FormFieldComponent.error]] accordingly.
 *
 * e.g. if you do something like.
 * ```html
 * <w-form [model]="formData" endpoint="kab/area">
 *  <w-form-field key="month">
 *   <w-month-picker label="Bulan" [(value)]="formData.month"></w-month-picker>
 *  </w-form-field>
 * </w-form>
 * ```
 *
 * where the form model is:
 *
 * ```typescript
 * class FormModel extends RestModel {
 *  @IsNotEmpty({ message: 'Is Required' })
 *  month: number;
 * }
 * ```
 *
 * on submit, it will show the error message below the MonthPickerComponent field saying 'Is Required'
 */
@Component({
  selector: 'w-form',
  templateUrl: './form.component.html'
})
export class FormComponent extends BaseForm implements OnInit {
  /** the API endpoint, required */
  @Input() endpoint: string;

  @Input() insertText = 'Submit';

  @Input() insertedMsg = 'Data berhasil dibuat';

  @Input() updateText = 'Update';

  @Input() updatedMsg = 'Data berhasil diupdate';

  /** emits on inserted only */
  @Output() inserted = new EventEmitter<number>();

  /** emits on updated only */
  @Output() updated = new EventEmitter();

  /** emits on successfully submitted for both insert and update  */
  @Output() submitted = new EventEmitter();

  loading = false;

  get submitBtnLabel(): string { return this.model.isNew ? this.insertText : this.updateText; }

  constructor(private _api: ApiService, private _snackBar: MatSnackBar) { super(); }

  ngOnInit() {
    if (!this.endpoint) { console.error('@Input() endpoint cant be empty'); }
  }

  async submit() {
    const valid: boolean = await this.validateForm();
    if (valid) {
      // do submit
      this.loading = true;
      this.model.isNew ? this._insert() : this._update();
    }
  }

  _insert(): void {
    this._api.insert(this.endpoint, this.model).subscribe(r => {
      this._processResponse(r, this.insertedMsg);
      if (r.success) { this.inserted.emit(r.data.id); }
    });
  }

  _update(): void {
    this._api.put(this.endpoint, this.model.id, this.model).subscribe(r => {
      this._processResponse(r, this.updatedMsg);
      if (r.success) { this.updated.emit(); }
    });
  }

  _processResponse(response: ApiResponse<any>, successMsg: string): void {
    this.loading = false;
    this._snackBar.open(response.success ? successMsg : response.msg ?? response.data.toString(), 'OK', { duration: 2000 });
    if (response.success) { this.submitted.emit(); }
  }
}
