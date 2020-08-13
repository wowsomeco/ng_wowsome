import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { randomId } from 'src/wowsome/scripts/utils';

/**
 * Acts as a wrapper for native <input type="file"/>
 * that hides it and shows a label with a border instead to prettify it.
 * It outputs (selectedFile) when a file gets opened via File Browser.
 */
@Component({
  selector: 'w-btn-upload',
  templateUrl: './btn-upload.component.html'
})
export class BtnUploadComponent {
  /** Accepted file e.g. .zip, etc. */
  @Input() accept: string;

  /** when it's true, the file input is disabled */
  @Input() disabled: boolean;

  /** the model */
  @Input()
  get value(): File { return this._file; }
  set value(f: File) {
    this._file = f;
    this.fileName = f ? f.name : undefined;
  }

  private _file: File;

  /** Emitter that gets triggered everytime a new file is selected from the File Browser */
  @Output() valueChange = new EventEmitter<File>();

  id: string = randomId();

  fileName: string;

  get fname() { return this.fileName ?? 'Choose File'; }

  onFileSelected(e: Event) {
    const file: File = (e.target as HTMLInputElement).files[0];
    if (file) {
      this.fileName = file.name;
      this.valueChange.emit(file);
    }
  }
}
