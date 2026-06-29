export class MinHeap {
  constructor() { this._heap = []; }

  get size() { return this._heap.length; }
  peek()     { return this._heap[0] ?? null; }

  push(node) {
    this._heap.push(node);
    this._bubbleUp(this._heap.length - 1);
  }

  pop() {
    const top  = this._heap[0];
    const last = this._heap.pop();
    if (this._heap.length > 0) {
      this._heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  toSortedArray() {
    return [...this._heap]
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return new Date(b.notification.created_at) - new Date(a.notification.created_at);
      })
      .map((n) => n.notification);
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this._heap[parent].score <= this._heap[i].score) break;
      [this._heap[parent], this._heap[i]] = [this._heap[i], this._heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this._heap.length;
    while (true) {
      let smallest = i;
      const left   = 2 * i + 1;
      const right  = 2 * i + 2;
      if (left  < n && this._heap[left].score  < this._heap[smallest].score) smallest = left;
      if (right < n && this._heap[right].score < this._heap[smallest].score) smallest = right;
      if (smallest === i) break;
      [this._heap[i], this._heap[smallest]] = [this._heap[smallest], this._heap[i]];
      i = smallest;
    }
  }
}

export function topNByPriority(notifications, N, scoreFn) {
  const heap = new MinHeap();
  for (const notif of notifications) {
    const score = scoreFn(notif);
    if (heap.size < N) {
      heap.push({ score, notification: notif });
    } else if (heap.peek() && score < heap.peek().score) {
      heap.pop();
      heap.push({ score, notification: notif });
    }
  }
  return heap.toSortedArray();
}
