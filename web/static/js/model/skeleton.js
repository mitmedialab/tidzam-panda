class Skeleton {
  constructor() {
    this.id       = generate_id();
    this.selected = false;
    this.joints   = null;

    this.reset();
  }

  center_point() {
    let pos = new Vector2D();
    let n   = 0;

    for(let key of Object.keys(SKELETON)) {
      let joint = this.joints[key];
      if(joint == null) continue;

      pos.x += joint.pos.x;
      pos.y += joint.pos.y;
      n++;
    }

    if(n == 0) return pos;
    return new Vector2D(pos.x / n, pos.y / n);
  }

  flip_v() {
    let center = this.center_point();

    for(let key of Object.keys(SKELETON)) {
      let joint = this.joints[key];
      if(joint == null) continue;

      let d       = center.x - joint.pos.x;
      joint.pos.x = center.x + d;
    }
  }

  flip_h() {
    let center = this.center_point();

    for(let key of Object.keys(SKELETON)) {
      let joint = this.joints[key];
      if(joint == null) continue;

      let d       = center.y - joint.pos.y;
      joint.pos.y = center.y + d;
    }
  }

  reset() {
    this.joints   = {};
    for(let key of Object.keys(SKELETON)) this.joints[key] = null;
  }

  add_joint(joint_type) {
    let _pos = SKELETON_DEFAULT_POS[SKELETON[joint_type]];
    let pos  = new Vector2D(_pos[0], _pos[1]);
    let col  = JOINT_COLORS[SKELETON[joint_type]];

    this.joints[joint_type] = new Joint(pos, col, joint_type);
    return this.joints[joint_type];
  }

  remove_joint(joint_type) {
    let joint = this.joints[joint_type];
    if(joint == null) return;

    this.joints[joint_type] = null;
  }

  draw_line(joint_a, joint_b) {
    stroke(lerpColor(joint_a.get_color(), joint_b.get_color(), 0.5));
    strokeWeight(JOINT_CONNECTION_STROKE_WEIGHT);
    line(joint_a.pos.x, joint_a.pos.y, joint_b.pos.x, joint_b.pos.y);
  }

  draw_nose_eye_line() {
    if(this.joints['NOSE'] == null || this.joints['L_EYE'] == null || this.joints['R_EYE'] == null) return;

    let pos_nose       = createVector(this.joints['NOSE'].pos.x, this.joints['NOSE'].pos.y, 0);
    let pos_l_eye      = createVector(this.joints['L_EYE'].pos.x, this.joints['L_EYE'].pos.y, 0);
    let pos_r_eye      = createVector(this.joints['R_EYE'].pos.x, this.joints['R_EYE'].pos.y, 0);

    let col_nose       = this.joints['NOSE'].get_color();
    let col_l_eye      = this.joints['L_EYE'].get_color();
    let col_r_eye      = this.joints['R_EYE'].get_color();

    let pos_mid_eye      = p5.Vector.lerp(pos_l_eye, pos_r_eye, 0.5);
    let col_mid_eye      = lerpColor(col_l_eye, col_r_eye, 0.5);

    stroke(lerpColor(col_nose, col_mid_eye, 0.5));
    strokeWeight(JOINT_CONNECTION_STROKE_WEIGHT);
    line(pos_nose.x, pos_nose.y, pos_mid_eye.x, pos_mid_eye.y);
  }

  draw_eye_shoulder_line() {
    if(this.joints['L_EYE'] == null || this.joints['R_EYE'] == null || this.joints['L_SHOULDER'] == null || this.joints['R_SHOULDER'] == null) return;

    let pos_l_eye      = createVector(this.joints['L_EYE'].pos.x, this.joints['L_EYE'].pos.y, 0);
    let pos_r_eye      = createVector(this.joints['R_EYE'].pos.x, this.joints['R_EYE'].pos.y, 0);
    let pos_l_shoulder = createVector(this.joints['L_SHOULDER'].pos.x, this.joints['L_SHOULDER'].pos.y, 0);
    let pos_r_shoulder = createVector(this.joints['R_SHOULDER'].pos.x, this.joints['R_SHOULDER'].pos.y, 0);

    let col_l_eye      = this.joints['L_EYE'].get_color();
    let col_r_eye      = this.joints['R_EYE'].get_color();
    let col_l_shoulder = this.joints['L_SHOULDER'].get_color();
    let col_r_shoulder = this.joints['R_SHOULDER'].get_color();

    let pos_mid_eye      = p5.Vector.lerp(pos_l_eye, pos_r_eye, 0.5);
    let col_mid_eye      = lerpColor(col_l_eye, col_r_eye, 0.5);

    let pos_mid_shoulder = p5.Vector.lerp(pos_l_shoulder, pos_r_shoulder, 0.5);
    let col_mid_shoulder = lerpColor(col_l_shoulder, col_r_shoulder, 0.5);

    stroke(lerpColor(col_mid_shoulder, col_mid_eye, 0.5));
    strokeWeight(JOINT_CONNECTION_STROKE_WEIGHT);
    line(pos_mid_shoulder.x, pos_mid_shoulder.y, pos_mid_eye.x, pos_mid_eye.y);
  }

  draw_l_hip_shoulder_line() {
    if(this.joints['L_HIP'] == null || this.joints['L_SHOULDER'] == null) return;

    let pos_l_hip      = createVector(this.joints['L_HIP'].pos.x, this.joints['L_HIP'].pos.y, 0);
    let pos_l_shoulder = createVector(this.joints['L_SHOULDER'].pos.x, this.joints['L_SHOULDER'].pos.y, 0);

    let col_l_hip      = this.joints['L_HIP'].get_color();
    let col_l_shoulder = this.joints['L_SHOULDER'].get_color();

    stroke(lerpColor(col_l_shoulder, col_l_hip, 0.5));
    strokeWeight(JOINT_CONNECTION_STROKE_WEIGHT);
    line(pos_l_shoulder.x, pos_l_shoulder.y, pos_l_hip.x, pos_l_hip.y);
  }

  draw_r_hip_shoulder_line() {
    if(this.joints['R_HIP'] == null || this.joints['R_SHOULDER'] == null) return;

    let pos_r_hip      = createVector(this.joints['R_HIP'].pos.x, this.joints['R_HIP'].pos.y, 0);
    let pos_r_shoulder = createVector(this.joints['R_SHOULDER'].pos.x, this.joints['R_SHOULDER'].pos.y, 0);

    let col_r_hip      = this.joints['R_HIP'].get_color();
    let col_r_shoulder = this.joints['R_SHOULDER'].get_color();

    stroke(lerpColor(col_r_shoulder, col_r_hip, 0.5));
    strokeWeight(JOINT_CONNECTION_STROKE_WEIGHT);
    line(pos_r_shoulder.x, pos_r_shoulder.y, pos_r_hip.x, pos_r_hip.y);
  }

  draw_hip_shoulder_line() {
    this.draw_l_hip_shoulder_line();
    this.draw_r_hip_shoulder_line();
  }

  draw_mid_lines() {
    this.draw_nose_eye_line();
    this.draw_eye_shoulder_line();
    this.draw_hip_shoulder_line();
  }

  draw() {
    let center = this.center_point();
    strokeWeight(JOINT_STROKE_WEIGHT);
    stroke(color(255, 255, 255, 125));
    noFill();
    ellipse(center.x, center.y, JOINT_RADIUS * 2);

    for (let joint_type of Object.keys(this.joints)) {
      let joint = this.joints[joint_type];
      if(joint == null) continue;

      joint.alpha_factor = (this.selected)? ALPHA_FACTOR_ENABLED: ALPHA_FACTOR_DISABLED;
      joint.draw();
    }

    for(let key of Object.keys(JOINT_CONNECTIONS)) {
      let joint_a = this.joints[key];
      if(joint_a == null) continue;

      let joint_b = this.joints[JOINT_CONNECTIONS[key]];
      if(joint_b == null) continue;

      this.draw_line(joint_a, joint_b);
    }

    this.draw_mid_lines();

  }
}
