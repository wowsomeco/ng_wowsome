import { Component, Input } from '@angular/core';
import { LayoutService } from './layout.service';

/**
 * The default layout
 * It consists of 3 sections i.e w-header, w-sidebar, and w-main
 */
@Component({
  selector: 'w-layout',
  templateUrl: './layout.component.html',
  providers: [LayoutService]
})
export class LayoutComponent {
  /// w-header height in percent.
  /// default is 8 %.
  @Input() headerHeight = 8;

  /// w-sidebar width in percent.
  /// default is 20%.
  @Input() sidebarWidth = 20;

  get contentWidth() { return 100 - this.sidebarWidth; }

  get contentHeight() { return 100 - this.headerHeight; }

  get collapsed() { return this._service.collapsed; }
  set collapsed(v: boolean) { this._service.collapsed = v; }

  constructor(private _service: LayoutService) { }
}
