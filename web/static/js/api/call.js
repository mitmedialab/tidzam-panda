async function loadComputedFrames() {
  let url = '*';
  IS_LOADING_COMPUTED_FRAMES = true;
  updateButtons();

  $.ajaxSetup({ async: true });
  $.get(url, function(data) {

    let json = JSON.parse(JSON.stringify(data, null, 4));
    if(json.length <= 0) return;

    json.sort((a, b) => a.frame_id - b.frame_id);

    SELECTOR.reset();
    CURRENT_FRAME = -1;
    FRAMES        = [];

    for(let frame_canvas of json) {
      let id = frame_canvas.frame_id;

      while(CURRENT_FRAME != id - 1) nextFrame(false, true);
      let frame = new Frame(loadImage(frame_canvas.img));
      FRAMES.push(frame);

      if('skeletons' in frame_canvas == false) continue;
      let skeletons = frame_canvas.skeletons;

      for(let skeleton of skeletons){
        let s = frame.addSkeleton();

        for(let label of Object.keys(SKELETON)){
          let joint = skeleton.keypoints[label];
          let j     = s.addJoint(label);
          j.pos     = new Vector2D(joint[0] * IMAGE_SCALE, joint[1] * IMAGE_SCALE);
          j.state   = joint[2];

          j.pos.x = Math.min(Math.max(j.pos.x, 0), width);
          j.pos.y = Math.min(Math.max(j.pos.y, 0), height);
        }
      }
    }

    CURRENT_FRAME = 0;

  }).then(function() {
    IS_LOADING_COMPUTED_FRAMES = false;
    if(FRAMES.length > 0) PREVIEW = true;
    updateButtons();
  });
}

function getFrame(id) {
  let url  = '' + id;

  let json = null;
  $.ajaxSetup({ async: false });
  $.get(url, function(data){
    json = JSON.parse(JSON.stringify(data, null, 4));
  });

  return json;
}

function postFrame(frame, id) {
  let json = JSON.stringify(frame.toJSON(), null, 4);

  $.ajaxSetup({ async: false });
  $.ajax({
    type       : 'POST',
    url        : '' + id,
    data       : json,
    contentType: "application/json",
    dataType   : 'json'
  });

  if(FRAMES.length > 0) FRAMES[CURRENT_FRAME].changed = false;
}

function getVideoList() {
  let url = 'video/';

  let json = null;
  $.ajaxSetup({ async: false });
  $.get(url, function(data){
    json = JSON.parse(JSON.stringify(data, null, 4));
  });

  return json;
}

function getStatus() {
  let url  = 'status';

  let json = null;
  $.ajaxSetup({ async: false });
  $.get(url, function(data){
    json = JSON.parse(JSON.stringify(data, null, 4));
  });

  return json;
}

function setStatus(status) {
  $.ajaxSetup({ async: false });
  $.ajax({
    type       : 'POST',
    url        : 'status',
    data       : JSON.stringify({ 'status': status }, null, 4),
    contentType: "application/json",
    dataType   : 'json'
  });
}
