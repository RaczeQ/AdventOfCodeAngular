//Modified https://gist.github.com/Youka/e28beeb31f585ac9b9532636cadbdb8d

// Linked data structure part
interface DequeNode<T> {
  previous?: DequeNode<T>;
  value: T;
  next?: DequeNode<T>;
}
// Double-ended queue structure
export class Deque<T> {
  private first?: DequeNode<T> = undefined;
  private last?: DequeNode<T> = undefined;
  private size: number = 0;

  public get length(): number {
    return this.size;
  }
  public get array(): T[] {
    var result: T[] = [];
    var current = this.first;
    while (current !== undefined) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
  public pushBack(value: T) {
    // Update last
    const last = this.last;
    this.last = { previous: last, value: value, next: undefined };
    if (last !== undefined) last.next = this.last;
    // Update first
    if (this.first === undefined) this.first = this.last;
    // Update size
    this.size++;
    // Return new size
    return this.size;
  }
  public pushFront(value: T) {
    // Update first
    const first = this.first;
    this.first = { previous: undefined, value: value, next: first };
    if (first !== undefined) first.previous = this.first;
    // Update last
    if (this.last === undefined) this.last = this.first;
    // Update size
    this.size++;
    // Return new size
    return this.size;
  }

  public popBack() {
    // Check possibility
    if (this.size === 0) return undefined;
    // Update last
    const entry = this.last;
    this.last = entry!.previous;
    if (this.last !== undefined) this.last.next = undefined;
    // Update first
    if (this.first === entry) this.first = undefined;
    // Update size
    this.size--;
    // Return value of removed entry
    return entry!.value;
  }
  public popFront() {
    // Check possibility
    if (this.size === 0) return undefined;
    // Update first
    const entry = this.first;
    this.first = entry!.next;
    if (this.first !== undefined) this.first.previous = undefined;
    // Update last
    if (this.last === entry) this.last = undefined;
    // Update size
    this.size--;
    // Return value of removed entry
    return entry!.value;
  }
  public rotate(n: number) {
    if (this.size > 0) {
      var rotateForward = Math.sign(n) > 0;
      for (let i = 0; i < Math.abs(n); i++) {
        if (rotateForward) {
          this.pushBack(this.popFront()!);
        } else {
          this.pushFront(this.popBack()!);
        }
      }
    }
  }
}
