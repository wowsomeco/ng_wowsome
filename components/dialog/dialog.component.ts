import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'w-dialog',
  templateUrl: 'dialog.component.html',
})
export class DialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  hide(): void { this.dialogRef.close(); }
}

@Component({
  template: `
  <w-dialog>
    <w-leaflet [features]="data.features"></w-leaflet>
  </w-dialog>
  `,
  selector: 'leaflet-dialog',
})
export class LeafletDialogComponent extends DialogComponent { }
