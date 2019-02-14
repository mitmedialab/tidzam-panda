class Joint {
  constructor(pos, col, label) {
    this.id           = generate_id();
    this.pos          = pos;
    this.col          = color(col);
    this.label        = label;
    this.alpha_factor = ALPHA_FACTOR_DISABLED;
    this.selected     = false;
    this.hover        = false;
  }

  get_color() {
    let alpha = (this.hover)? ALPHA_SELECTED:
                (this.selected)? ALPHA_SELECTED: ALPHA_UNSELECTED;
    alpha     = alpha * this.alpha_factor;

    return color(
      this.col.levels[0],
      this.col.levels[1],
      this.col.levels[2],
      alpha
    );
  }

  draw() {
    let col = this.get_color();

    strokeWeight(JOINT_STROKE_WEIGHT);
    stroke(col);
    fill(col);
    ellipse(this.pos.x, this.pos.y, JOINT_RADIUS * 2);

    strokeWeight(TEXT_STROKE_WEIGHT);
    textSize(TEXT_SIZE);
    textAlign(CENTER, CENTER);
    text(this.label, this.pos.x, this.pos.y - TEXT_SIZE * 1.5);
  }
}
