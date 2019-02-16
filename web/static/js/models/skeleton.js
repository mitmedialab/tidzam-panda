class Skeleton {
  constructor() {
    this.id       = generateId();

    this.pos      = new Vector2D();
    this.joints   = null;

    this.selected = false;
    this.hover    = false;

    this.resetJoints();
  }

  setDefaultSkeleton() {
    for(let label of Object.keys(SKELETON)) this.addJoint(label);
  }

  scale(factor) {
    for(let label of Object.keys(SKELETON)) {
      let joint = this.joints[label];
      if(joint == null) continue;

      joint.pos.x *= factor;
      joint.pos.y *= factor;
    }

    let old_pos = this.pos;
    let new_pos = this.getBarycenter();

    let d = new Vector2D(old_pos - new_pos)
  }

  toJSON() {
    let json = {
      'id' : this.id
    };

    let skeleton = {};
    for(let label of Object.keys(SKELETON))
      skeleton[label] = this.joints[label].toJSON();

    json['keypoints'] = skeleton;

    let bounds = this.getBounds();
    let bbox   = [
      bounds.min[0] / IMAGE_SCALE,
      bounds.min[1] / IMAGE_SCALE,
      (bounds.max[0] - bounds.min[0]) / IMAGE_SCALE,
      (bounds.max[1] - bounds.min[1]) / IMAGE_SCALE
    ];

    json['bbox'] = bbox;

    return json;
  }

  getBounds() {
    let xs = [];
    let ys = [];

    for(let label of Object.keys(SKELETON)) {
      let joint = this.joints[label];
      if(joint == null) continue;

      xs.push(joint.pos.x);
      ys.push(joint.pos.y);
    }

    if(xs.length <= 0) return { 'min': [0, 0], 'max': [0, 0] };

    return {
      'min': [Math.min(...xs), Math.min(...ys)],
      'max': [Math.max(...xs), Math.max(...ys)]
    };
  }

  getBarycenter() {
    let pos = new Vector2D();
    let n   = 0;

    for(let label of Object.keys(SKELETON)) {
      let joint = this.joints[label];
      if(joint == null) continue;

      pos.x += joint.pos.x;
      pos.y += joint.pos.y;
      n++;
    }

    if(n == 0) return pos;
    return new Vector2D(pos.x / n, pos.y / n);
  }

  flipVertical() {
    let center = this.getBarycenter();

    for(let label of Object.keys(SKELETON)) {
      let joint = this.joints[label];
      if(joint == null) continue;

      let d       = center.x - joint.pos.x;
      joint.pos.x = center.x + d;
    }

    FRAMES[CURRENT_FRAME].changed = true;
  }

  flipHorizontal() {
    let center = this.getBarycenter();

    for(let label of Object.keys(SKELETON)) {
      let joint = this.joints[label];
      if(joint == null) continue;

      let d       = center.y - joint.pos.y;
      joint.pos.y = center.y + d;
    }

    FRAMES[CURRENT_FRAME].changed = true;
  }

  resetJoints() {
    this.joints   = {};
    for(let key of Object.keys(SKELETON)) this.joints[key] = null;
  }

  addJoint(label) {
    let _pos = SKELETON_DEFAULT_POS[SKELETON[label]];
    let pos  = new Vector2D(_pos[0], _pos[1]);

    this.joints[label] = new Joint(pos, label, this);

    this.pos = this.getBarycenter();

    return this.joints[label];
  }

  removeJoint(label) {
    let joint = this.joints[label];
    if(joint == null) return;

    this.joints[label] = null;

    this.pos = this.skeleton.getBarycenter();
  }

  drawCenter() {
    strokeWeight(JOINT_STROKE_WEIGHT);
    stroke(255, 255, 255, 125);
    noFill();
    ellipse(this.pos.x, this.pos.y, JOINT_RADIUS * 2);
  }

  drawJoints() {
    for (let label of Object.keys(SKELETON)) {
      let joint = this.joints[label];
      if(joint == null) continue;

      joint.alpha_factor = this.hover? ALPHA_FACTOR_ENABLED: ALPHA_FACTOR_DISABLED;

      joint.draw();
    }
  }

  drawLine(joint_a, joint_b) {
    stroke(lerpColor(joint_a.getColor(), joint_b.getColor(), 0.5));
    strokeWeight(JOINT_CONNECTION_STROKE_WEIGHT);
    line(joint_a.pos.x, joint_a.pos.y, joint_b.pos.x, joint_b.pos.y);
  }

  drawNoseEyeLine() {
    if(this.joints['NOSE'] == null || this.joints['L_EYE'] == null || this.joints['R_EYE'] == null) return;

    let pos_nose       = createVector(this.joints['NOSE'].pos.x, this.joints['NOSE'].pos.y, 0);
    let pos_l_eye      = createVector(this.joints['L_EYE'].pos.x, this.joints['L_EYE'].pos.y, 0);
    let pos_r_eye      = createVector(this.joints['R_EYE'].pos.x, this.joints['R_EYE'].pos.y, 0);

    let col_nose       = this.joints['NOSE'].getColor();
    let col_l_eye      = this.joints['L_EYE'].getColor();
    let col_r_eye      = this.joints['R_EYE'].getColor();

    let pos_mid_eye      = p5.Vector.lerp(pos_l_eye, pos_r_eye, 0.5);
    let col_mid_eye      = lerpColor(col_l_eye, col_r_eye, 0.5);

    stroke(lerpColor(col_nose, col_mid_eye, 0.5));
    strokeWeight(JOINT_CONNECTION_STROKE_WEIGHT);
    line(pos_nose.x, pos_nose.y, pos_mid_eye.x, pos_mid_eye.y);
  }

  drawEyeShoulderLine() {
    if(this.joints['L_EYE'] == null || this.joints['R_EYE'] == null || this.joints['L_SHOULDER'] == null || this.joints['R_SHOULDER'] == null) return;

    let pos_l_eye      = createVector(this.joints['L_EYE'].pos.x, this.joints['L_EYE'].pos.y, 0);
    let pos_r_eye      = createVector(this.joints['R_EYE'].pos.x, this.joints['R_EYE'].pos.y, 0);
    let pos_l_shoulder = createVector(this.joints['L_SHOULDER'].pos.x, this.joints['L_SHOULDER'].pos.y, 0);
    let pos_r_shoulder = createVector(this.joints['R_SHOULDER'].pos.x, this.joints['R_SHOULDER'].pos.y, 0);

    let col_l_eye      = this.joints['L_EYE'].getColor();
    let col_r_eye      = this.joints['R_EYE'].getColor();
    let col_l_shoulder = this.joints['L_SHOULDER'].getColor();
    let col_r_shoulder = this.joints['R_SHOULDER'].getColor();

    let pos_mid_eye      = p5.Vector.lerp(pos_l_eye, pos_r_eye, 0.5);
    let col_mid_eye      = lerpColor(col_l_eye, col_r_eye, 0.5);

    let pos_mid_shoulder = p5.Vector.lerp(pos_l_shoulder, pos_r_shoulder, 0.5);
    let col_mid_shoulder = lerpColor(col_l_shoulder, col_r_shoulder, 0.5);

    stroke(lerpColor(col_mid_shoulder, col_mid_eye, 0.5));
    strokeWeight(JOINT_CONNECTION_STROKE_WEIGHT);
    line(pos_mid_shoulder.x, pos_mid_shoulder.y, pos_mid_eye.x, pos_mid_eye.y);
  }

  drawLHipShoulderLine() {
    if(this.joints['L_HIP'] == null || this.joints['L_SHOULDER'] == null) return;

    let pos_l_hip      = createVector(this.joints['L_HIP'].pos.x, this.joints['L_HIP'].pos.y, 0);
    let pos_l_shoulder = createVector(this.joints['L_SHOULDER'].pos.x, this.joints['L_SHOULDER'].pos.y, 0);

    let col_l_hip      = this.joints['L_HIP'].getColor();
    let col_l_shoulder = this.joints['L_SHOULDER'].getColor();

    stroke(lerpColor(col_l_shoulder, col_l_hip, 0.5));
    strokeWeight(JOINT_CONNECTION_STROKE_WEIGHT);
    line(pos_l_shoulder.x, pos_l_shoulder.y, pos_l_hip.x, pos_l_hip.y);
  }

  drawRHipShoulderLine() {
    if(this.joints['R_HIP'] == null || this.joints['R_SHOULDER'] == null) return;

    let pos_r_hip      = createVector(this.joints['R_HIP'].pos.x, this.joints['R_HIP'].pos.y, 0);
    let pos_r_shoulder = createVector(this.joints['R_SHOULDER'].pos.x, this.joints['R_SHOULDER'].pos.y, 0);

    let col_r_hip      = this.joints['R_HIP'].getColor();
    let col_r_shoulder = this.joints['R_SHOULDER'].getColor();

    stroke(lerpColor(col_r_shoulder, col_r_hip, 0.5));
    strokeWeight(JOINT_CONNECTION_STROKE_WEIGHT);
    line(pos_r_shoulder.x, pos_r_shoulder.y, pos_r_hip.x, pos_r_hip.y);
  }

  drawHipShoulderLine() {
    this.drawLHipShoulderLine();
    this.drawRHipShoulderLine();
  }

  drawConnections() {
    for(let label of Object.keys(JOINT_CONNECTIONS)) {
      let joint_a = this.joints[label];
      if(joint_a == null) continue;

      let joint_b = this.joints[JOINT_CONNECTIONS[label]];
      if(joint_b == null) continue;

      this.drawLine(joint_a, joint_b);
    }

    this.drawNoseEyeLine();
    this.drawEyeShoulderLine();
    this.drawHipShoulderLine();
  }

  drawLabel() {
    for(let label of Object.keys(SKELETON)) {
      let joint = this.joints[label];
      if(joint == null) continue;

      joint.drawLabel();
    }
  }

  draw() {
    this.drawCenter();
    this.drawJoints();
    this.drawConnections();
  }

  move(mouse) {
    for(let label of Object.keys(SKELETON)) {
      let joint = this.joints[label];
      if(joint == null) continue;

      joint.move(mouse);
    }

    FRAMES[CURRENT_FRAME].changed = true;
  }

  click() {
    this.selected = !this.selected;
  }

  isHover(mouse) {
    let bounds = this.getBounds();

    this.hover = mouse.x > bounds.min[0] - JOINT_RADIUS &&
                 mouse.x < bounds.max[0] + JOINT_RADIUS &&
                 mouse.y > bounds.min[1] - JOINT_RADIUS &&
                 mouse.y < bounds.max[1] + JOINT_RADIUS;

    for(let label of Object.keys(SKELETON)) {
        let joint = this.joints[label];
        if(joint == null) continue;

        if(!this.hover) joint.hover = false;
    }

    return this.hover;
  }
}
