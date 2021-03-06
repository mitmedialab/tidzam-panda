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

    this.pos.x = Math.min(Math.max(this.pos.x, 0), width);
    this.pos.y = Math.min(Math.max(this.pos.y, 0), height);
  }

  copy() {
    let joint          = new Joint(new Vector2D(this.pos.x, this.pos.y), this.label, this.skeleton);
    joint.id           = this.id;
    joint.alpha_factor = this.alpha_factor;
    joint.selected     = this.selected;
    joint.hober        = this.hover;
    joint.state        = this.state;

    return joint;
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

  switchState() {
    this.state = (this.state == JOINT_STATES['UNLABELED']) ? JOINT_STATES['LABELED_VISIBLE'] :
                 JOINT_STATES['UNLABELED'];
  }

  drawLabel() {
    if(this.selected || this.hover) {
      strokeWeight(TEXT_STROKE_WEIGHT);
      stroke(this.col);
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

    if(this.state == JOINT_STATES['LABELED_VISIBLE']) fill(col);
    else noFill();

    ellipse(this.pos.x, this.pos.y, (this.hover? 1.2: 1) * JOINT_RADIUS * 2);
  }

  move(mouse) {
    this.pos.x = Math.min(Math.max(this.pos.x + mouse.x, 0), width);
    this.pos.y = Math.min(Math.max(this.pos.y + mouse.y, 0), height);

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
