let SELECTOR      = new Selector();

let FRAMES        = [];
let CURRENT_FRAME = -1;
let TOTAL_FRAME   = 0;
let PLAY          = false;

let IMAGE_W       = 1080;
let IMAGE_H       = null;
let IMAGE_SCALE   = null;

function setFrame() {
  let json = getFrame(CURRENT_FRAME);

  IMAGE_SCALE = IMAGE_W / json.width;
  IMAGE_H     = int(IMAGE_SCALE * json.height);
  TOTAL_FRAME = json.size;

  let img   = loadImage(json.img);
  let frame = new Frame(img);
  FRAMES.push(frame);

  if('skeletons' in json == false) return;
  if(json.skeletons.length <= 0) return;

  let skeletons = json.skeletons;
  for(let skeleton of skeletons){
    let s = frame.addSkeleton();

    for(let label of Object.keys(SKELETON)){
      let joint = skeleton.keypoints[label];
      let j     = s.addJoint(label);
      j.pos     = new Vector2D(joint[0] * IMAGE_SCALE, joint[1] * IMAGE_SCALE);
      j.state   = joint[2];
    }
  }
}

function nextFrame() {
  if(CURRENT_FRAME != -1 && CURRENT_FRAME == TOTAL_FRAME - 1) return;
  if(FRAMES.length > 0) postFrame(FRAMES[CURRENT_FRAME], CURRENT_FRAME);

  CURRENT_FRAME++;
  SELECTOR.reset();
  updateButtons();

  setFrame();
}

function prevFrame() {
  if(CURRENT_FRAME == 0) return;

  postFrame(FRAMES[CURRENT_FRAME], CURRENT_FRAME);
  CURRENT_FRAME--;
  updateButtons();
}

function firstFrame() {
  if(CURRENT_FRAME == 0) return;

  if(FRAMES.length > 0) postFrame(FRAMES[CURRENT_FRAME], CURRENT_FRAME);
  CURRENT_FRAME = 0;
  updateButtons();
}

function playFrame() {
  PLAY = true;
  updateButtons();
}

function stopFrame() {
  PLAY = false;
  updateButtons();
}

function addPanda() {
  let skeleton = FRAMES[CURRENT_FRAME].addSkeleton();
  skeleton.setDefaultSkeleton();
  updateButtons();

  FRAMES[CURRENT_FRAME].changed = true;
}

function updateButtons() {
  $( '#PLAY' ).html(PLAY ? '<i class="fas fa-stop"></i>': '<i class="fas fa-play"></i>');
  $( '#PLAY' ).attr('onclick', PLAY ? 'javascript: stopFrame()': 'javascript: playFrame()');
  $( '#PLAY' ).prop('disabled', (CURRENT_FRAME == TOTAL_FRAME - 1));

  $( '#NEXT' ).prop('disabled', (CURRENT_FRAME == TOTAL_FRAME - 1 || PLAY));
  $( '#PREV' ).prop('disabled', (CURRENT_FRAME == 0 || PLAY));

  $( '#FIRST' ).prop('disabled', (CURRENT_FRAME == 0 || PLAY));

  $( '#ADD' ).prop('disabled', PLAY);
}
