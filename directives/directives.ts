import { Directive, Input, ElementRef, OnInit, OnDestroy, Output, EventEmitter, ViewContainerRef } from '@angular/core';

/**
 * Directive for binding the native HTML event and can be used to stop propagation or prevent default accordingly.
 *
 * ```html
 * <div wOn="click.stop" (wListen)="onClick()"></div>
 * ```
 */
@Directive({
  selector: '[wOn]'
})
export class EventBindingDirective implements OnInit, OnDestroy {
  /**
   * the string of event and the handlers separated by dots
   * where the first item indicates the event to listen to followed be the methods to be called
   * e.g. click.stop.prevent
   * means on click, stopPropagation(), and preventDefault()
   */
  @Input('wOn') on: string;

  @Output() wListen = new EventEmitter<Event>();

  private _separator = '.';
  private _eventHandlers: Record<string, (ev: Event) => void> = {
    stop: ev => ev.stopPropagation(),
    prevent: ev => ev.preventDefault()
  };

  get onAsArray(): string[] { return this.on.split(this._separator); }

  get event(): string { return this.onAsArray.shift(); }

  get handlers(): string[] {
    const arr = this.onAsArray;
    arr.shift();
    return arr;
  }

  constructor(private _el: ElementRef<HTMLElement>) { }

  private _listen(event: Event): void {
    this.handlers.forEach(h => this._eventHandlers[h](event));
    this.wListen.emit(event);
  }

  ngOnInit() {
    this._el.nativeElement.addEventListener(this.event, (e) => this._listen(e));
  }

  ngOnDestroy() {
    this._el.nativeElement.removeEventListener(this.event, this._listen);
  }
}

/**
 * Directive that is useful for adding classes to the element on hover.
 * Set the class via [[hoverClass]] prop accordingly
 * Each element will be prefixed by 'hover:' , refer to tailwind website for more details
 *
 * sample:
 *
 * ```html
 * <div wHoverable="['t-bg-blue-300', 't-text-white']"></div>
 * ```
 *
 * Above code will add 'hover:t-bg-blue-300 hover:t-text-white' to the div class
 */
@Directive({
  selector: '[wHoverAnim]'
})
export class HoverAnimDirective implements OnInit {
  /**
   * the class(es) that will be assign to the element where this directive is attached to.
   * you dont need to specify the 'hover:' prefix as it will automagically add it for each of the string in the array.
   * e.g. ['t-text-white'] will get transformed into 'hover:t-text-white'
   */
  @Input('wHoverAnim') hoverClass: string[] = [];

  /** linear | in | out | in-out */
  @Input() ease = 'in-out';

  /**
   * 75 ... 1000
   * for more details, https://tailwindcss.com/docs/transition-duration/#app
   */
  @Input() duration = 500;

  constructor(private _el: ElementRef<HTMLElement>) {
    // default classes
    _el.nativeElement.classList.add(...['t-cursor-pointer', 't-transition', 't-transform']);
  }

  ngOnInit() {
    this._el.nativeElement.classList.add(
      ...this.hoverClass.map(x => `hover:${x}`),
      ...[`t-ease-${this.ease}`, `t-duration-${this.duration}`]
    );
  }
}

@Directive({
  selector: '[wComponentHost]',
})
export class DynamicComponentHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
