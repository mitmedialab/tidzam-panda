class Joint {
  constructor(pos, label, skeleton) {
    this.id           = generateId();
    this.label        = label;
    this.skeleton     = skeleton;

    this.pos          = pos;
    this.col          = color(JOINT_COLORS[SKELETON[label]]);
    this.alpha_factor = ALPHA_FACTOR_DISABLED;

    this.selected     = false;
    this.hover        = false;

    this.state        = JOINT_STATES['LABELED_VISIBLE'];
  }

  toJSON() {
    return [this.pos.x / IMAGE_SCALE, this.pos.y / IMAGE_SCALE, this.state];
  }

  getColor() {
    let alpha = this.hover    ? ALPHA_SELECTED:
                this.selected ? ALPHA_SELECTED:
                ALPHA_UNSELECTED;

    return color(
      this.col.levels[0],
      this.col.levels[1],
      this.col.levels[2],
      alpha * this.alpha_factor
    );
  }

  drawLabel() {
    if(this.selected || this.hover) {
      strokeWeight(TEXT_STROKE_WEIGHT);
      stroke(JOINT_COLORS[SKELETON[this.label]]);
      fill(255, 255, 255);
      textSize(TEXT_SIZE);
      textAlign(CENTER, CENTER);
      text(this.label, this.pos.x, this.pos.y - TEXT_SIZE * 1.5);
    }
  }

  draw() {
    let col = this.getColor();

    strokeWeight(JOINT_STROKE_WEIGHT);
    stroke(col);
    fill(col);
    ellipse(this.pos.x, this.pos.y, (this.hover? 1.2: 1) * JOINT_RADIUS * 2);
  }

  move(mouse) {
    this.pos.x += mouse.x;
    this.pos.y += mouse.y;

    this.skeleton.pos = this.skeleton.getBarycenter();
    FRAMES[CURRENT_FRAME].changed = true;
  }

  click() {
    this.selected = !this.selected;
  }

  isHover(mouse) {
    this.hover = dist(mouse.x, mouse.y, this.pos.x, this.pos.y) < JOINT_RADIUS;

    return this.hover;
  }
}
