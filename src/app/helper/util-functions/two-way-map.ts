export class TwoWayMap<K, V> {
  map: Map<K, V>;
  reverseMap: Map<V, K>;
  constructor() {
    this.map = new Map<K, V>();
    this.reverseMap = new Map<V, K>();
  }
  get(key: K) {
    return this.map.get(key);
  }
  set(key: K, value: V) {
    this.map.set(key, value);
    this.reverseMap.set(value, key);
  }
  delete(key: K) {
    var value = this.map.get(key)!;
    this.map.delete(key);
    this.reverseMap.delete(value);
  }
  revGet(key: V) {
    return this.reverseMap.get(key);
  }
  values() {
    return [...this.reverseMap.keys()];
  }
}

export class TwoWayNumberMap extends TwoWayMap<number, number> {
  private static eps: number = 0.00005;
  override set(key: number, value: number) {
    var alteredValue = value;
    while (this.reverseMap.has(alteredValue)) {
      alteredValue -= TwoWayNumberMap.eps;
    }
    this.map.set(key, alteredValue);
    this.reverseMap.set(alteredValue, key);
  }
}
