export class Queue<T> {
  protected _store: T[] = [];
  get store(): T[] {
    return this._store;
  }
  isEmpty(): boolean {
    return this._store.length == 0;
  }
  enqueue(val: T) {
    this._store.push(val);
  }
  dequeue(): T | undefined {
    return this._store.shift();
  }
  clear(): void {
    this._store = [];
  }
}
