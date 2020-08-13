import { Component, Input } from '@angular/core';

export interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: string;
  onClick?: (path: string) => void;
}

@Component({
  selector: 'w-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
})
export class BreadcrumbsComponent {
  /** Refer to Tailwind text-color, minus the suffix number */
  @Input() activeColor = 'blue';

  /** Refer to Tailwind text-color */
  @Input() inactiveColor = 'gray-600';

  @Input() items: BreadcrumbItem[];

  clickItem(item: BreadcrumbItem, isLast: boolean) {
    if (!isLast && item.onClick) { item.onClick(item.path); }
  }

  itemClass(isLast: boolean): string {
    const activeCls = `t-text-${this.activeColor}-400 t-cursor-pointer t-transition t-duration-500 t-ease-in-out hover:t-text-${this.activeColor}-900`;
    const inactiveCls = `t-text-${this.inactiveColor}`;
    return isLast ? inactiveCls : activeCls;
  }
}
