let MOUSE = null;

function preload() {
  nextFrame();
  MOUSE = new Vector2D(mouseX, mouseY);
}

function setup() {
  let canvas = createCanvas(IMAGE_W, IMAGE_H);
  canvas.class('canvas');
  canvas.id('canvas');
  canvas.parent('card-canvas');
}

function mousePressed() {
  SELECTOR.click();
}

function keyPressed() {
  if(keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW) SELECTOR.key('FLIP_V');
  if(keyCode == UP_ARROW   || keyCode == DOWN_ARROW)  SELECTOR.key('FLIP_H');
  if(keyCode == DELETE     || keyCode == BACKSPACE)   SELECTOR.key('DELETE')
}

function draw() {
  if(PLAY){
    if(CURRENT_FRAME < TOTAL_FRAME - 1) nextFrame();
    else stopFrame();
  }

  let mouse   = new Vector2D(mouseX, mouseY);
  let d_mouse = new Vector2D(mouseX - MOUSE.x, mouseY - MOUSE.y);

  SELECTOR.frame = FRAMES[CURRENT_FRAME];
  if(SELECTOR.frame == null) return;

  SELECTOR.update(mouse, d_mouse);

  background(0);
  SELECTOR.frame.draw();

  MOUSE = new Vector2D(mouseX, mouseY);
}
