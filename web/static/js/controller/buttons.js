function resetJointButton(button) {
  button.className = 'button-joint';
  button.setAttribute("onclick", "javascript: onJointButton(this, this.id);");
}

function resetResetButton(button) {
  button.className = "button-joint-enabled";
  button.setAttribute("onclick", "javascript: onResetButton();");
}

function resetSelector() {
  _SELECTOR.skeleton.reset();
  _SELECTOR.joint = null;
}

function onResetButton() {
  if(_SELECTOR.skeleton == null) return;

  resetSelector();
  resetResetButton(document.getElementById('RESET'));
  for(let key of Object.keys(SKELETON)) {
    let button = document.getElementById(key);
    resetJointButton(button);
  }
}


function onJointRemove(button, id) {
  _SELECTOR.skeleton.remove_joint(id);
  resetJointButton(button);
}

function disableButton(button) {
  button.className = 'button-joint-disabled';
  button.setAttribute("onclick", "");
}

function disableJointsMenu() {
  let BUTTONS = [];
  BUTTONS.push(document.getElementById('RESET'));
  for(let key of Object.keys(SKELETON)) BUTTONS.push(document.getElementById(key));

  for (let button of BUTTONS) disableButton(button);
}

function onJointButton(button, id) {
  if(_SELECTOR.skeleton == null) return;
  if(_SELECTOR.joint != null) return;

  let joint       = _SELECTOR.skeleton.add_joint(id);
  _SELECTOR.joint = null;

  button.className = 'button-joint-selected';
  button.setAttribute("onclick", "javascript: onJointRemove(this, this.id)");
}


function make_default_skeleton() {
  for(let key of Object.keys(SKELETON))
    onJointButton(document.getElementById(key), key);
}

function createPandaButton(id, idx) {
  let button = "<div id=\"" + id + "\" class=\"button-holder\">";
  button    += "<button class=\"button-plain\" onclick=\"onPandaButton(this.parentNode.id)\">PANDA " + idx + "</button>";
  button    += "<button class=\"button-del\" onclick=\"onRemovePandaButton(this.parentNode.id)\">x</button>";
  button    += "</div>";

  return button;
}

function onAddPandaButton() {
  let skeleton = _SELECTOR.frame_data.add_skeleton();

  let handle = document.getElementById('card-pandas');
  let panda  = createPandaButton(skeleton.id, _SELECTOR.frame_data.skeletons.length);
  handle.insertAdjacentHTML('beforeend', panda);

  onPandaButton(skeleton.id);
  make_default_skeleton();
}

function setJointButtons(skeleton) {
  let BUTTONS = [];
  for(let key of Object.keys(SKELETON)) BUTTONS.push(document.getElementById(key));

  for (let button of BUTTONS) {
    let is_filled = skeleton.joints[button.id] != null;

    button.className = (is_filled == true)? 'button-joint-selected': 'button-joint';
    button.setAttribute("onclick", (is_filled == true)? "javascript: onJointRemove(this, this.id)": "javascript: onJointButton(this, this.id);");
  }
}

function onPandaButton(id) {
  let skeleton                = _SELECTOR.frame_data.skeletons.filter(s => s.id == id)[0];
  _SELECTOR.skeleton          = skeleton;
  _SELECTOR.skeleton.selected = true;

  if(_SELECTOR.joint != null) _SELECTOR.joint.selected = false;
  _SELECTOR.joint = null;

  let RESET       = document.getElementById('RESET');
  RESET.className = "button-joint-enabled"
  RESET.setAttribute("onclick", "javascript: onResetButton();");

  setJointButtons(skeleton);
  showPandaSelected();
}

function setPandaButtons() {
  let handle   = document.getElementById('card-pandas');
  while (handle.firstChild) handle.removeChild(handle.firstChild);

  handle.insertAdjacentHTML('beforeend', "<button id=\"ADD\" class=\"button-border\" onclick=\"onAddPandaButton()\"><span>+</span> ADD</button>");
}

function onRemovePandaButton(id) {
  let skeleton = _SELECTOR.frame_data.skeletons.filter(s => s.id == id)[0];
  _SELECTOR.frame_data.remove_skeleton(skeleton);

  setPandaButtons();

  let handle = document.getElementById('card-pandas');

  let i = 1;
  for(let skeleton of _SELECTOR.frame_data.skeletons) {
    handle.insertAdjacentHTML('beforeend', createPandaButton(skeleton.id, i));
    i++;
  }

  if(_SELECTOR.skeleton != null) _SELECTOR.skeleton.selected = false;
  _SELECTOR.skeleton = null;

  if(_SELECTOR.joint != null) _SELECTOR.joint.selected = false;
  _SELECTOR.joint = null;

  if(handle.childNodes.length <= 1) disableJointsMenu();
  showPandaSelected();
}

function showPandaSelected() {
  let handle = document.getElementById('card-pandas');

  for(let child of handle.childNodes) {
    if(child.id == 'ADD') continue;

    let button       = child.childNodes[0];
    button.className = (_SELECTOR.skeleton == null || _SELECTOR.skeleton.id != child.id)? 'button-plain': 'button-plain panda-selected';
  }
}

function formatSkeletons() {
  let _skeletons = _SELECTOR.frame_data.skeletons;
  let skeletons  = []

  for(let _skeleton of _skeletons) {
    let skeleton = {};

    for(let _joint_type of Object.keys(SKELETON)) {
      let _joint = _skeleton.joints[_joint_type];

      skeleton[_joint_type] = (_joint == null)? null: [_joint.pos.x / IMAGE_SCALE, _joint.pos.y / IMAGE_SCALE];
    }

    skeletons.push(skeleton);
  }

  return { skeletons: skeletons };
}

function submitSkeletonForFrame() {
  let skeletons = formatSkeletons();

  $.ajax({
    type: 'POST',
    url: 'video/' + VIDEO_URL + '/' + CURRENT_FRAME,
    data: JSON.stringify(skeletons),
    contentType: 'application/json',
    dataType: 'json'
  });
}

function onStopButton(button) {
  button.id        = 'PLAY';
  button.innerHTML = 'PLAY';
  button.setAttribute("onclick", "javascript: onPlayButton(this)");

  document.getElementById('FIRST').disabled = false;
  document.getElementById('PREV').disabled  = false;
  document.getElementById('NEXT').disabled  = false;

  document.getElementById('FIRST').className = 'button-control';
  document.getElementById('PREV').className  = 'button-control';
  document.getElementById('NEXT').className  = 'button-control';

  document.getElementById('ADD').disabled  = false;
  document.getElementById('ADD').className = 'button-border';
}

function onPlayButton(button) {
  button.id        = 'STOP';
  button.innerHTML = 'STOP';
  button.setAttribute("onclick", "javascript: onStopButton(this)");

  document.getElementById('FIRST').disabled = true;
  document.getElementById('PREV').disabled  = true;
  document.getElementById('NEXT').disabled  = true;

  document.getElementById('FIRST').className = 'button-control-disabled';
  document.getElementById('PREV').className  = 'button-control-disabled';
  document.getElementById('NEXT').className  = 'button-control-disabled';

  document.getElementById('ADD').disabled  = true;
  document.getElementById('ADD').className = 'button-border-disabled';
}

function onNextButton(submit=false) {
  if(CURRENT_FRAME + 1 >= TOTAL_FRAMES) {
    if(PLAY_BUTTON.id == 'STOP') onStopButton(PLAY_BUTTON);
    return;
  }
  if(submit) submitSkeletonForFrame();

  CURRENT_FRAME++;

  if(CURRENT_FRAME > _FRAMES_DATA.length - 1) getFrame(CURRENT_FRAME);
  _SELECTOR.frame_data = _FRAMES_DATA[CURRENT_FRAME];

  partialReset();
}

function onPrevButton() {
  if(CURRENT_FRAME - 1 < 0) return;
  CURRENT_FRAME--;

  _SELECTOR.frame_data = _FRAMES_DATA[CURRENT_FRAME];

  partialReset();
}

function onFirstButton() {
  CURRENT_FRAME        = 0;
  _SELECTOR.frame_data = _FRAMES_DATA[CURRENT_FRAME];

  partialReset();
}

function partialReset() {
  setPandaButtons();

  let handle = document.getElementById('card-pandas');

  let i = 1;
  for(let skeleton of _SELECTOR.frame_data.skeletons) {
    handle.insertAdjacentHTML('beforeend', createPandaButton(skeleton.id, i));
    i++;
  }

  disableJointsMenu();

  if(_SELECTOR.joint != null) _SELECTOR.joint.selected = False;
  if(_SELECTOR.skeleton != null) _SELECTOR.skeleton.selected = False;

  _SELECTOR.joint    = null;
  _SELECTOR.skeleton = null;
}


function onFlipButton(mode) {
  if(mode == 'v') _SELECTOR.skeleton.flip_v();
  else if(mode == 'h') _SELECTOR.skeleton.flip_h();
}
