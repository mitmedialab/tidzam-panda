class FrameData {
  constructor(img) {
    this.id        = generate_id();
    this.img       = img;
    this.skeletons = [];
  }

  add_skeleton() {
    this.skeletons.push(new Skeleton());
    console.log('ADD SKELETON:', this.skeletons.length - 1);
    return this.skeletons[this.skeletons.length - 1];
  }

  remove_skeleton(skeleton) {
    console.log('REMOVE SKELETON:', skeleton.id);
    this.skeletons = this.skeletons.filter(s => s.id != skeleton.id);
  }

  add_joint_to_skeleton(joint_type, skeleton_id) {
    if(this.skeletons.length <= 0 || skeleton_id >= this.skeletons.length)
      return null;

    let skeleton = this.skeletons[skeleton_id];
    if(skeleton == null) return null;

    return skeleton.add_joint(joint_type);
  }

  remove_joint_from_skeleton(joint_type, skeleton_id) {
    if(this.skeletons.length <= 0 || skeleton_id >= this.skeletons.length)
      return;

    let skeleton = this.skeletons[skeleton_id];
    if(skeleton == null) return;

    skeleton.remove_joint(joint_type);
  }

  draw() {
    for(let skeleton of this.skeletons) {
      skeleton.draw();
    }
  }
}
