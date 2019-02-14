class Vector2D {
  constructor(x=0, y=0) {
    this.x = x;
    this.y = y;
  }

  copy() {
    return new Vector2D(this.x, this.y);
  }
}
