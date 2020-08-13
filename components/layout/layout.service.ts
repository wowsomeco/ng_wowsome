import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class LayoutService {
  _collapsed = true;
  set collapsed(v: boolean) {
    this._collapsed = v;
    this.collapsed$.next(v);
  }
  get collapsed() { return this._collapsed; }

  collapsed$ = new Subject<boolean>();
}
