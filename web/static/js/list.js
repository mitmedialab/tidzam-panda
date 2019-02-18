let VIDEOS = getVideoList();
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

function setVideoButtons(videos) {
  for(let video of VIDEOS) setVideoButton(video);
}
