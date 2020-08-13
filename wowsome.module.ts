// angular stuff
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRippleModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatTooltipModule } from '@angular/material/tooltip';
// our stuff
// components
import { SelectComponent } from './components/select/select.component';
import { BtnUploadComponent } from './components/btn-upload/btn-upload.component';
import { SpatialFieldComponent } from './components/spatial-field/spatial-field.component';
import { LeafletComponent } from './components/leaflet/leaflet.component';
import { DialogComponent, LeafletDialogComponent } from './components/dialog/dialog.component';
import { BtnComponent } from './components/btn/btn.component';
import { MonthPickerComponent, YearPickerComponent } from './components/pickers/month-year-picker.component';
import { DatepickerComponent } from './components/pickers/datepicker.component';
import { TableComponent } from './components/table/table.component';
import { FormComponent, BasicFormComponent } from './components/forms/form.component';
import { FieldComponent, FormFieldComponent } from './components/forms/form-field.component';
import { OverlayComponent } from './components/overlay/overlay.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { LayoutComponent } from './components/layout/layout.component';
// directives
import { HoverAnimDirective, EventBindingDirective, DynamicComponentHostDirective } from './directives/directives';
import { FrappeDirective } from './directives/frappe';

const _imports = [
  BrowserModule,
  BrowserAnimationsModule,
  CommonModule,
  MatRippleModule,
  ReactiveFormsModule,
  FormsModule,
  HttpClientModule,
  MatCardModule,
  MatButtonModule,
  MatDividerModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatChipsModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatToolbarModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatTabsModule,
  MatDialogModule,
  MatTableModule,
  MatPaginatorModule,
  MatSnackBarModule,
  MatTooltipModule,
  MatCheckboxModule,
  OverlayModule
];

const _modules = [
  // core
  LayoutComponent,
  SelectComponent,
  BtnUploadComponent,
  LeafletComponent,
  DialogComponent,
  LeafletDialogComponent,
  SpatialFieldComponent,
  BtnComponent,
  MonthPickerComponent,
  YearPickerComponent,
  DatepickerComponent,
  TableComponent,
  FieldComponent,
  FormFieldComponent,
  BasicFormComponent,
  FormComponent,
  OverlayComponent,
  BreadcrumbsComponent,
  // directives
  EventBindingDirective,
  HoverAnimDirective,
  DynamicComponentHostDirective,
  FrappeDirective
];

@NgModule({
  declarations: _modules,
  imports: _imports,
  exports: [..._imports, ..._modules],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
  ]
})
export class WowsomeModule { }
