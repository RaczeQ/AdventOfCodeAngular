export class Stack<T> {
  constructor(
    private capacity: number = Infinity,
    protected _store: T[] = []
  ) {}

  get store(): T[] {
    return this._store;
  }

  push(item: T): void {
    if (this.size() === this.capacity) {
      throw Error('Stack has reached max capacity, you cannot add more items');
    }
    this._store.push(item);
  }

  pop(): T | undefined {
    return this._store.pop();
  }

  peek(): T | undefined {
    return this._store[this.size() - 1];
  }

  size(): number {
    return this._store.length;
  }

  copy(): Stack<T> {
    return new Stack<T>(this.capacity, Object.assign([], this._store));
  }
}
