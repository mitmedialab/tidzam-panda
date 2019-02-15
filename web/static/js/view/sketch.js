let IMAGE_W     = null;
let IMAGE_H     = null;
let IMAGE_SCALE = null;

let _FRAMES_DATA = null;
let _SELECTOR    = null;

let CURRENT_FRAME = 0;
let TOTAL_FRAMES  = 1;

let PLAY_BUTTON = null;

function getFrame(id) {
  let url = 'video/' + VIDEO_URL + '/' + id;

  $.ajaxSetup({async: false});
  $.get(url, function(data) {
    let json = JSON.parse(data);

    IMAGE_W      = 800;
    IMAGE_SCALE  = IMAGE_W / json.width;
    IMAGE_H      = int(IMAGE_SCALE * json.height);
    TOTAL_FRAMES = json.size;

    let img = loadImage(json.img);
    _FRAMES_DATA.push(new FrameData(img));

    if('skeletons' in json) {
      let skeletons = json.skeletons;

      _FRAMES_DATA[CURRENT_FRAME].skeletons = [];
      for(let skeleton of skeletons) {
          let _skeleton = new Skeleton();

          for(let key of Object.keys(SKELETON)) {
            if(key in skeleton == false) continue;

            _skeleton.joints[key] = new Joint(
              Vector2D(skeleton[key][0] * IMAGE_SCALE, skeleton[key][1] * IMAGE_SCALE),
              JOINT_COLORS[KELETON[key]],
              key
            );
          }

          _FRAMES_DATA[CURRENT_FRAME].skeletons.push(_skeleton);
      }
    }

  });
}

function preload() {
  _FRAMES_DATA = [];
  _SELECTOR    = new Selector();
  PLAY_BUTTON  = document.getElementById('PLAY');

  getFrame(0);
  _SELECTOR.frame_data = _FRAMES_DATA[CURRENT_FRAME];

  let handle = document.getElementById('card-joints');
  for(let key of Object.keys(SKELETON))
    handle.insertAdjacentHTML(
      'beforeend',
      "<button id=\"" + key +"\" class=\"button-joint-disabled\">" + key + "</button>"
    );
}

function setup() {
  let canvas = createCanvas(IMAGE_W, IMAGE_H);
  canvas.class('canvas');
  canvas.id('canvas');
  canvas.parent('card-canvas');
}

function mousePressed() {
  _SELECTOR.click();
}

function draw() {
  if(PLAY_BUTTON.id == 'PLAY') _SELECTOR.update(new Vector2D(mouseX, mouseY));
  else onNextButton();

  background(0);
  image(_SELECTOR.frame_data.img, 0, 0, IMAGE_W, IMAGE_H);

  _SELECTOR.frame_data.draw();
}
