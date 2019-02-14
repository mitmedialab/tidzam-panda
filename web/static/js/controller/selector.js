class Selector {
  constructor() {
    this.frame_data  = null;
    this.skeleton    = null;
    this.joint       = null;
    this.joint_hover = null;
  }

  select_skeleton() {
    for(let skeleton of _SELECTOR.frame_data.skeletons) {
      skeleton.selected = (skeleton == this.skeleton);
    }
  }

  click() {
    if(this.joint != null) this.release_joint();
    else if(this.joint_hover != null) this.take_joint();
  }

  take_joint() {
    if(this.joint_hover == null) return;
    if(this.join != null) return;

    this.joint          = this.joint_hover;
    this.joint.selected = true;
    console.log('TAKE', this.joint);
  }

  release_joint() {
    if(this.joint == null) return;

    console.log('RELEASE', this.joint);
    this.joint.selected = false;
    this.joint          = null;
  }

  update_joint(mouse_pos) {
    this.joint.selected = true;
    this.joint.pos      = new Vector2D(
      min(max(mouse_pos.x, 0), width),
      min(max(mouse_pos.y, 0), height)
    );

    for(let joint_type in this.skeleton.joints) {
      let joint = this.skeleton.joints[joint_type];
      if(joint == null || this.joint == joint) continue;

      joint.selected = false;
      joint.hover    = false;
    }
  }

  choose_joint(mouse_pos) {
    this.joint_hover = null;

    for(let joint_type in this.skeleton.joints) {
      let joint = this.skeleton.joints[joint_type];
      if(joint == null) continue;

      joint.selected   = false;

      if(dist(mouse_pos.x, mouse_pos.y, joint.pos.x, joint.pos.y) < JOINT_RADIUS) {
        joint.hover      = true;
        this.joint_hover = joint;
      }
      else joint.hover = false;
    }
  }

  select_joint(mouse_pos) {
    if(this.joint != null) this.update_joint(mouse_pos);
    else this.choose_joint(mouse_pos);
  }

  update(mouse_pos) {
    if(this.skeleton == null) return;

    this.select_skeleton();

    this.skeleton.selected = true;
    this.select_joint(mouse_pos);
  }
}
