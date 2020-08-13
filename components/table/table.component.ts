import { Component, Input, ContentChild, TemplateRef, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ApiService } from '@services/api.service';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { tryParseNumber } from 'src/wowsome/scripts/utils';

class TableFilter {
  constructor(public operand: string, public value: string | number) { }

  get clause() { return `${this.operand},${this.value}`; }

  combine(k: string, isLast: boolean): string {
    return `${k},${this.clause}` + (isLast ? '[and]' : '');
  }
}

/**
 * Table Component that wraps <mat-table> with more addons to simplify things up.
 *
 * Right now it can only be used for online data fetched from the backend.
 *
 * sample:
 *
 * ```html
 * <w-table
 * [rowMapper]="rowMapper"
 * [(loading)]="loadingTable"
 * [endpoint]="endpoint"
 * [selectClause]="selectClause" [whereClause]="whereClause" [deletable]="true"
 * (clickRow)="clickRow($event)" [reload]="reloadTable">
 *  <button slot="top-right" (click)="addNew()" mat-raised-button color="primary">Tambah Baru</button>
 *  <ng-template #filter let-data let-emitter="emitter">
 *   <div class="t-py-2 t-flex">
 *    <div class="t-w-1/2 lg:t-mr-2">
 *      <w-month-picker label="Bulan" [value]="data.month" (valueChange)="emitter.next(`month,=,${event}`)"></w-month-picker>
 *    </div>
 *   </div>
 *  </ng-template>
 * </w-table>
 * ```
 */
@Component({
  selector: 'w-table',
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit {
  /** the API endpoint */
  @Input() endpoint: string;

  /** e.g ['name', 'date'] */
  @Input() selectClause: string[];

  /** e.g id,=,1[and]month,>,1 */
  @Input() whereClause;

  /** when it's true, the delete button will show on the actions column */
  @Input() deletable = false;

  @Input() onDeleteMsg = 'Apakah anda yakin?';

  @Input() noResultMsg = 'Tidak ada data';

  /**
   * e.g. ['edit', ...]
   * whenever it's set, it will show the item(s) in the actions column according to the string in the array
   */
  @Input() actions: string[] = [];

  /**
   * The reload observable.
   * if set, then whenever the reload event gets triggered from the parent, it will reload the table.
   */
  @Input() reload: Subject<void>;

  /**
   * the callback mapper for the row that gets called for each of the original row item.
   * let's say the original item is
   * ```typescript
   *
   * { name:"Bob", dob:"1987-11-20" }
   * // and you would like to transform the table item into
   * { name:"Bob", age:33 }
   *
   * // then the mapper needs to be
   *
   * rowMapper = (orig: Record<string, any>) => {
   *  return {
   *   name: orig.name,
   *   age: dobToAge(orig.dob)
   *  };
   * }
   *
   * // where dobToAge is a utility function or whatever that you can use accordingly.
   * ```
   *
   * Might want to change this later so that row can have properties that exist but dont need to show.
   */
  @Input() rowMapper: (f: Record<string, any>) => Record<string, any>;

  @Input() loading = false;

  @Output() loadingChange = new EventEmitter<boolean>(true);

  /** even emiited whenever the row is clicked */
  @Output() clickRow = new EventEmitter<Record<string, any>>();

  /**
   * even emiited after the row has been deleted.
   * in order to get this event, [[deletable]] must be set to true
   */
  @Output() deletedRow = new EventEmitter<number>();

  @ContentChild('row') row: TemplateRef<any>;
  @ContentChild('filter') filter: TemplateRef<any>;
  @ContentChild('acts') acts: TemplateRef<any>;

  model: Record<string, any>[] = [];
  headers: string[];
  currentPage = 1;
  pageLength = 0;
  /** might want to define this as Input() later. */
  pageSize = 10;
  /** e.g. id,>,1 */
  filterObserver: Subject<string> = new Subject<string>();
  /** the getter filter data, that will be passed down to #filter content template. */
  filterData: Record<string, TableFilter> = {};

  get showActions(): boolean {
    return this.deletable || this.actions.length > 0;
  }

  get allCols(): string[] {
    const cols = this.headers;
    return this.showActions ? [...cols, 'actions'] : [...cols];
  }

  get isEmpty(): boolean {
    return this.model.length === 0;
  }

  get filterClause(): string {
    let filter = '';
    const filterKeys = Object.keys(this.filterData);

    filterKeys.forEach((k, i) => {
      filter += this.filterData[k].combine(k, i < filterKeys.length - 1);
    });

    // set suffix and if where clause exists
    return this.whereClause && filter ? `[and]${filter}` : filter;
  }

  get whereQuery(): string {
    const whr = this.whereClause || this.filterClause ? 'where=' : '';
    return `${whr}${this.whereClause}${this.filterClause}`;
  }

  get tableQuery(): string {
    const cols = this.selectClause.reduce((prev, x) => prev += `,${x}`);
    const limit = this.currentPage * this.pageSize;
    const offset = limit - this.pageSize;

    return `?select=id,${cols}&limit=${limit},${offset}&${this.whereQuery}`;
  }

  constructor(private _api: ApiService) { }

  changePage(ev: PageEvent) {
    this.pageSize = ev.pageSize;
    this.currentPage = ev.pageIndex + 1;
    this._fetch();
  }

  onClickRow(r: Record<string, any>) { this.clickRow.emit(r); }

  deleteRow(r: Record<string, any>) {
    if (confirm(this.onDeleteMsg)) {
      this._api.delete(this.endpoint, r.id).subscribe(deleteResp => {
        if (deleteResp.success) {
          this.deletedRow.emit(r.id);
          this._fetch();
        }
      });
    }
  }

  ngOnInit() {
    // observe reload from parent, if any
    // on set reload, fetch the table items
    if (this.reload) { this.reload.subscribe(() => this._fetch()); }
    // filter observer
    this.filterObserver.pipe(debounceTime(500)).subscribe(ev => {
      // e.g. id,>,1
      const splits = ev.split(',');
      const k = splits[0];
      const operand = splits[1];
      // delete filter if null AND the condition does not contain 'is'
      // fuckin hacky... lets revisit this again later
      if (!operand.includes('is') && (!splits[2] || splits[2] === 'null')) {
        delete this.filterData[k];
      } else {
        // try parsing the value to number.
        // this anticipates the w-field that has number value e.g. month-picker , year-picker, etc.
        // a bit hacky but works for now.
        const v = tryParseNumber(splits[2]);
        const item: TableFilter = new TableFilter(operand, v);
        // update filter data
        this.filterData[k] = item;
      }
      // refetch
      this._fetch();
    });
    // fetch table on init
    this._fetch();
  }

  private async _fetch() {
    this.loadingChange.emit(true);
    // get count first
    this.pageLength = await this._api.getAsync<number>(`${this.endpoint}/count?${this.whereQuery}`);
    // get the data
    const endpoint = `${this.endpoint}${this.tableQuery}`;
    // reset
    this.headers = [...this.selectClause];
    this.model = [];
    // fetch data
    const response = await this._api.getAsync<Record<string, any>[]>(endpoint);
    response.forEach(r => {
      let row = r;
      // check if row mapper is set
      // if so then assign the row according to the mapper
      // need to reset the header accordingly to
      // because maybe
      if (this.rowMapper) {
        row = Object.assign({}, this.rowMapper(r));
        this.headers = Object.keys(row);
        row.id = r.id;
      }
      this.model.push(row);
    });
    // change loading to false
    this.loadingChange.emit(false);
  }
}
