let SELECTOR      = new Selector();

let FRAMES        = [];
let CURRENT_FRAME = -1;
let TOTAL_FRAME   = 0;
let PREVIEW       = false;
let STATUS        = 0;

let IMAGE_W       = 1080;
let IMAGE_H       = null;
let IMAGE_SCALE   = null;

function setFrame() {
  updateButtons();
  let json = getFrame(CURRENT_FRAME);

  IMAGE_SCALE = IMAGE_W / json.width;
  IMAGE_H     = int(IMAGE_SCALE * json.height);
  TOTAL_FRAME = json.size;

  let img   = loadImage(json.img);
  let frame = new Frame(img);

  if(CURRENT_FRAME > FRAMES.length - 1) FRAMES.push(frame);
  else FRAMES[CURRENT_FRAME] = frame;

  if('skeletons' in json == false) return;
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

  if(STATUS == 0 && FRAMES.length > 0) updateStatus(STATUS + 1);

  setFrame();
}

function prevFrame() {
  if(CURRENT_FRAME == 0) return;

  postFrame(FRAMES[CURRENT_FRAME], CURRENT_FRAME);
  CURRENT_FRAME--;
  updateButtons();

  if(STATUS == 0 && FRAMES.length > 0) updateStatus(STATUS + 1);

  setFrame();
}

function firstFrame() {
  if(CURRENT_FRAME == 0) return;

  if(FRAMES.length > 0) postFrame(FRAMES[CURRENT_FRAME], CURRENT_FRAME);
  CURRENT_FRAME = 0;
  updateButtons();

  if(STATUS == 0 && FRAMES.length > 0) updateStatus(STATUS + 1);
}

function playVideo() {
  PREVIEW = true;
  updateButtons();
}

function stopVideo() {
  PREVIEW = false;
  updateButtons();
}

function addPanda() {
  let skeleton = FRAMES[CURRENT_FRAME].addSkeleton();
  skeleton.setDefaultSkeleton();
  updateButtons();

  FRAMES[CURRENT_FRAME].changed = true;

  if(STATUS == 0 && FRAMES.length > 0) updateStatus(STATUS + 1);
  updateButtons();

  return skeleton;
}

function updateStatus(status) {
  STATUS = status;
  setStatus(status);

  $( '#STATUS-HEALTH' ).css('background-color',
    (status == 0) ? 'var(--unprocessed)' :
    (status == 1) ? 'var(--pending)' :
    'var(--processed)'
  );
  $( '#STATUS-HEALTH' ).css('width',
    (status == 0) ? '33.33%' :
    (status == 1) ? '66.66%' :
    '100%'
  );
}

function submitVideo() {
  let status = getStatus().status;
  if(status < 2) status++;
  updateStatus(status);

  updateButtons();
  backToList();
}

function backToList() {
  location.href = '/';
}

function incrementAction(skeleton) {
  skeleton.action++;
  if(skeleton.action >= Object.keys(ACTIONS).length) skeleton.action = 0;
}

function updateButtons() {
  $( '#NEXT' ).prop('disabled', (CURRENT_FRAME == TOTAL_FRAME - 1 || PREVIEW));
  $( '#PREV' ).prop('disabled', (CURRENT_FRAME <= 0 || PREVIEW));

  $( '#FIRST' ).prop('disabled', (CURRENT_FRAME <= 0 || PREVIEW));

  $( '#ADD' ).prop('disabled', (PREVIEW));

  $( '#BACK' ).prop('disabled', (PREVIEW));
  $( '#SUBMIT' ).prop('disabled', (FRAMES.length <= 0 || PREVIEW || STATUS != 1));
  $( '#PREVIEW' ).prop('disabled', (FRAMES.length <= 0 || CURRENT_FRAME >= TOTAL_FRAME - 1 || PREVIEW));
}
