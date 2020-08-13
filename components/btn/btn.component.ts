import { Component, Output, EventEmitter, Input } from '@angular/core';

/**
 * Button component with loading state
 */
@Component({
  selector: 'w-btn',
  templateUrl: './btn.component.html',
})
export class BtnComponent {
  /** primary | accent | warn */
  @Input() color: string;

  @Input() loading: boolean;

  /** primary | accent | warn */
  @Input() loadingColor = 'primary';

  /** type of the <button> */
  @Input() btnType = 'button';

  @Output() clicked = new EventEmitter();

  onClicked(): void {
    if (!this.loading) { this.clicked.emit(); }
  }
}
