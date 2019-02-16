function getFrame(id) {
  let url  = 'video/' + VIDEO_URL + '/' + id;

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
    url        : 'video/' + VIDEO_URL + '/' + id,
    data       : json,
    contentType: "application/json",
    dataType   : 'json'
  });
}
