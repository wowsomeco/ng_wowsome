import { Feature } from '@turf/helpers';
import area from '@turf/area';

/**
 * Gets the last element in an array.
 * @param arr Array of any object type
 * ```typescript
 * const last = lastElem([0,1,2,3]); // returns 3
 * ```
 */
export function lastElem<T>(arr: Array<T>): T {
  return arr?.[arr.length - 1];
}

/**
 * Gets a file extension from a string.
 * @param filename the filename
 * ```typescript
 * const extension = getFileExtension('ab.ab.png'); // returns png
 * ```
 */
export function getFileExtension(filename: string): string {
  return lastElem(filename.split('.'));
}

/**
 * Gets the key from an object that contains a string
 * @param obj the object
 * @param contains the checker
 * @returns The key of the object that satisfies the condition.
 */
export function keyWhere(obj: Record<string, any>, contains: string): string | undefined {
  const key: string = Object.keys(obj).find(x => x.includes(contains));
  if (!key) { throw new Error(`can't find key that contains=${contains} in ${obj}`); }
  return key;
}

/**
 * Gets key from the object comparing case insensitive.
 */
export function keyIgnoreCase(obj: Record<string, any>, contains: string): string | undefined {
  return Object.keys(obj).find(x => x.toLowerCase().includes(contains.toLowerCase()));
}

/**
 * Gets the key from a value of the object
 * @param obj the object
 * @param value the value consists in the object
 * @returns The key of the object associated with the value given
 */
export function keyByValue(obj: Record<string, any>, value: any): any {
  return Object.keys(obj).find(x => obj[x] === value);
}

export function keyAt(obj: Record<string, any>, idx: number): string {
  return Object.keys(obj)[idx];
}

export function propertyAt(obj: Record<string, any>, idx: number): any {
  return obj[keyAt(obj, idx)];
}

/**
 * Replaces all the characters from a string
 * @param str The target
 * @param oldValue the value to replace
 * @param newValue replace with this
 */
export function replaceAll(str: string, oldValue: string, newValue: string): string {
  return str.replace(new RegExp(oldValue, 'g'), newValue);
}

/**
 * Generates 9 characters random string id
 */
export function randomId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Tries parse string to number
 * if it's not a number, then will return the original string instead
 */
export function tryParseNumber(value: string): string | number {
  return isNaN(Number(value)) ? value : Number(value);
}

export function luasArea(features: Feature[]): number {
  const totalArea: number = features.reduce((prev, f) => prev += area(f) / 10000, 0);
  return totalArea;
}

/**
 * The helper class that has loading state in it.
 * Ideally used for fetchable type component e.g. SelectComponent, etc.
 */
export class Loadable<T> {
  private _loading = false;
  private _value: T;

  constructor(v: T) {
    this.value = v;
  }

  get loading(): boolean { return this._loading; }
  set loading(v: boolean) { this._loading = v; }

  get value(): T { return this._value; }
  set value(v: T) {
    this._value = v;
    this.loading = v === undefined;
  }
}
