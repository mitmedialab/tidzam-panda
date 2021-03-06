class Selector {
  constructor() {
    this.frame            = null;

    this.skeleton         = null;
    this.joint            = null;

    this.skeleton_hovered = null;
    this.joint_hovered    = null;
  }

  reset() {
    this.skeleton         = null;
    this.joint            = null;

    this.skeleton_hovered = null;
    this.joint_hovered    = null;
  }

  wheel(factor, increment) {
    if(this.skeleton != null) this.skeleton.scale(factor, increment);
  }

  click() {
    if(this.joint_hovered) {
      this.joint = this.joint_hovered;
      this.joint.click();
      return;
    }

    if(this.skeleton_hovered) {
      this.skeleton = this.skeleton_hovered;
      this.skeleton.click();
      return;
    }

    if(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      let skeleton  = addPanda();
      skeleton.pos  = skeleton.getBarycenter();
      let d         = new Vector2D(mouseX - skeleton.pos.x, mouseY - skeleton.pos.y);

      skeleton.move(d);

      skeleton.pos  = skeleton.getBarycenter();
      this.skeleton = skeleton;
      this.skeleton.isHover(new Vector2D(mouseX, mouseY));

      skeleton.click();
    }
  }

  release() {
    if(this.skeleton != null) {
      this.skeleton.click();
      this.skeleton = null;
      return;
    }

    if(this.joint != null) {
      this.joint.click();
      this.joint = null;
      return;
    }
  }

  key(action) {
    switch (action) {
      case 'FLIP_V':
        if(this.skeleton != null) this.skeleton.flipVertical();
        break;
      case 'FLIP_H':
        if(this.skeleton != null) this.skeleton.flipHorizontal();
        break;
      case 'DELETE':
        if(this.skeleton != null) {
          this.frame.removeSkeleton(this.skeleton);
          this.skeleton = null;
        }
        if(this.joint != null) {
          this.joint.switchState();
        }
        break;
      case 'ACTION':
        if(this.skeleton != null) incrementAction(this.skeleton);
        break;
    }
  }

  update(mouse, d_mouse) {
    if(this.frame == null) return;

    if(this.skeleton != null) {
      this.skeleton.move(d_mouse);
      return;
    }

    if(this.joint != null) {
      this.joint.move(d_mouse);
      return;
    }

    let skeletons = this.frame.skeletons;
    if(skeletons == null) return;

    this.joint_hovered = null;
    for(let skeleton of skeletons) {
      for(let label of Object.keys(SKELETON)) {
        let joint = skeleton.joints[label];
        if(joint == null) continue;

        if(joint.isHover(mouse))
          this.joint_hovered = joint;
      }
    }

    if(this.joint_hovered != null) return;

    this.skeleton_hovered = null;
    for(let skeleton of skeletons)
    if(skeleton.isHover(mouse))
    this.skeleton_hovered = skeleton;
  }
}
