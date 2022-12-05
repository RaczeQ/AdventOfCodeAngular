export class Queue<T> {
  protected _store: T[] = [];
  isEmpty(): boolean {
    return this._store.length == 0;
  }
  enqueue(val: T) {
    this._store.push(val);
  }
  dequeue(): T | undefined {
    return this._store.shift();
  }
}
