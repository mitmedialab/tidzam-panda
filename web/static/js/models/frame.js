class Frame {
  constructor(img) {
    this.id        = generateId();
    this.img       = img;

    this.skeletons = [];
    this.changed   = false;
  }

  toJSON() {
    let json = {
      'skeletons': []
    };

    for(let skeleton of this.skeletons)
      json.skeletons.push(skeleton.toJSON())

    return json;
  }

  addSkeleton() {
    let skeleton = new Skeleton();
    this.skeletons.push(skeleton);

    return skeleton;
  }

  removeSkeleton(skeleton) {
    this.skeletons = this.skeletons.filter(s => s.id != skeleton.id);
  }

  draw() {
    if (this.img != null) image(this.img, 0, 0, IMAGE_W, IMAGE_H);
    for(let skeleton of this.skeletons) skeleton.draw();
    for(let skeleton of this.skeletons) skeleton.drawLabel();
  }
}
