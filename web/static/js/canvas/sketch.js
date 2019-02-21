let MOUSE = null;

function preload() {
  nextFrame();
  MOUSE = new Vector2D(mouseX, mouseY);

  updateStatus(getStatus().status);
  updateButtons();
}

function setup() {
  let canvas = createCanvas(IMAGE_W, IMAGE_H);
  canvas.class('canvas');
  canvas.id('canvas');
  canvas.parent('card-canvas');
}

function mouseWheel(event) {
  if(PREVIEW == true) return;

  SELECTOR.wheel(event.delta > 0 ? 1.2 : 1 / 1.2, event.delta > 0 ? 1 : -1);
}

function mousePressed() {
  if(PREVIEW == true) return;

  SELECTOR.click();
}

function mouseReleased() {
  if(PREVIEW == true) return;

  SELECTOR.release();
}

function keyPressed() {
  if(PREVIEW == true) return;

  if(keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW) SELECTOR.key('FLIP_V');
  if(keyCode == UP_ARROW   || keyCode == DOWN_ARROW)  SELECTOR.key('FLIP_H');
  if(keyCode == DELETE     || keyCode == BACKSPACE)   SELECTOR.key('DELETE');
  if(keyCode == 32)                                   SELECTOR.key('ACTION');
}

function drawFrameInfo() {
  noStroke();
  fill(255, 255, 255);
  textSize(TEXT_SIZE);
  textAlign(LEFT, TOP);

  text('FRAME: ' + CURRENT_FRAME + '/' + (TOTAL_FRAME - 1), 10, 10);
  text('SKELETONS: ' + (
    SELECTOR.frame != null ? SELECTOR.frame.skeletons.length : 0
  ), 10, 10 + TEXT_SIZE + 10);
}

function draw() {
  if(CURRENT_FRAME == -1) {
    background(0);
    return;
  }

  if(PREVIEW) {
    let next_frame = nextFrameToSee();

    if(next_frame.stop == true) stopVideo();
    else CURRENT_FRAME = next_frame.next;
  }

  let mouse   = new Vector2D(mouseX, mouseY);
  let d_mouse = new Vector2D(mouseX - MOUSE.x, mouseY - MOUSE.y);

  SELECTOR.frame = FRAMES[CURRENT_FRAME];
  if(SELECTOR.frame == null) return;

  SELECTOR.update(mouse, d_mouse);

  background(0);
  SELECTOR.frame.draw();
  drawFrameInfo();

  MOUSE = new Vector2D(mouseX, mouseY);
}
