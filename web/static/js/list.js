let PROGRESSION  = 0;
let VIDEOS       = [];
let TOTAL_VIDEOS = 0;
let DONE         = 0;
let SORT_STATUS  = -1;

setVideoButtons();

function redirect(href) {
  location.href = href;
}

function getStatus(video) {
  let status = 'unprocessed';

  switch (parseInt(video.status)) {
    case 0:
        status = 'unprocessed'
      break;
    case 1:
        status = 'pending'
      break;
    case 2:
        status = 'verified'
      break;
  }

  return status
}

function setVideoButton(video) {
  let button = '<div id="card-list-row">';
  button    += '<div id="card-list-id">' + video._id + '</div>';
  button    += '<div id="card-list-size">' + video.width + 'x' + video.height + '</div>';
  button    += '<div id="card-list-path">' + video.path + '</div>';
  button    += '<div id="card-list-status-wrapper">';
  button    += '<div>' + getStatus(video) + '</div>';
  button    += '<div id="card-list-status" class="' + getStatus(video) + '"></div>';
  button    += '</div>';
  button    += '<button id="card-list-link" href="video/' + video._id + '/" onclick="redirect(this.getAttribute(\'href\'))">GO</button>';
  button    += '</div>';

  document.getElementById('card-list').insertAdjacentHTML('beforeend', button);
}

function setVideoButtons(status='all') {
  $( '#card-list' ).empty();

  let videos   = getVideoList();
  TOTAL_VIDEOS = videos.length;
  VIDEOS       = (status != 'all') ? videos.filter(e => e.status == parseInt(status)): videos;
  DONE         = videos.filter(e => e.status == 2).length;

  let perc = Math.round(DONE / TOTAL_VIDEOS * 100);
  $( '#card-progression-health' ).css('width', '' + perc + '% ');
  $( '#card-progression-text' ).html('' + perc + '% ');

  for(let video of VIDEOS) setVideoButton(video);
}
