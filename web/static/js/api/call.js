function getFrame(id) {
  let url  = '' + id;

  let json = null;
  $.ajaxSetup({async: false});
  $.get(url, function(data){
    json = JSON.parse(JSON.stringify(data, null, 4));
  });

  return json;
}

function postFrame(frame, id) {
  let json = JSON.stringify(frame.toJSON(), null, 4);

  $.ajaxSetup({async: false});
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
  $.ajaxSetup({async: false});
  $.get(url, function(data){
    json = JSON.parse(JSON.stringify(data, null, 4));
  });

  return json;
}

function getStatus() {
  let url  = 'status';

  let json = null;
  $.ajaxSetup({async: false});
  $.get(url, function(data){
    json = JSON.parse(JSON.stringify(data, null, 4));
  });

  return json;
}

function setStatus(status) {
  $.ajaxSetup({async: false});
  $.ajax({
    type       : 'POST',
    url        : 'status',
    data       : JSON.stringify({ 'status': status }, null, 4),
    contentType: "application/json",
    dataType   : 'json'
  });
}
