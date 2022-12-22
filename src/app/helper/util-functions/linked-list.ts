export interface LinkedListNode<T> {
  previous?: LinkedListNode<T>;
  value: T;
  next?: LinkedListNode<T>;
}

export function insertNode<T>(value: T, last?: LinkedListNode<T>) {
  let p: LinkedListNode<T> = { value };

  if (last === undefined) {
    p.previous = p;
    p.next = p;
  } else {
    p.next = last.next;
    p.previous = last;
    last.next!.previous = p;
    last.next = p;
  }
  return p;
}

export function removeNode<T>(p: LinkedListNode<T>) {
  p.next!.previous = p.previous;
  p.previous!.next = p.next;
}

export function findNode<T>(
  p: LinkedListNode<T>,
  value: T
): LinkedListNode<T> | undefined {
  var currentNode = p;
  do {
    if (currentNode.value === value) {
      return currentNode;
    }
    currentNode = currentNode.next!;
  } while (currentNode !== p);
  return;
}

export function swapWithNext<T>(p: LinkedListNode<T>) {
  var previous = p.previous!;
  var neighbour = p.next!;
  var next = neighbour.next!;

  previous.next = neighbour;

  neighbour.previous = previous;
  neighbour.next = p;

  p.previous = neighbour;
  p.next = next;

  next.previous = p;

  return p;
}

export function swapWithPrevious<T>(p: LinkedListNode<T>) {
  var next = p.next!;
  var neighbour = p.previous!;
  var previous = neighbour.previous!;

  next.previous = neighbour;

  neighbour.next = next;
  neighbour.previous = p;

  p.next = neighbour;
  p.previous = previous;

  previous.next = p;

  return p;
}
