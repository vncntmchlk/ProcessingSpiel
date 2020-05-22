let blocks = [];
let locked = false;
let xOffset = 0;
let yOffset = 0;
let pressed = false;
let lockID = -1;
let maxMove = 10;
let hitWall = 0;

function setup() {
  createCanvas(600,600);
  let col = 3;
  let row = 3;
  let cnt = 0;
  for(i = 0; i < col; i++){
    for(j = 0; j < row; j++){
        let x = i * (width / col);
        let y = j * (height / row);
        blocks.push(new Block(x,y,random(60,195),random(60,195), cnt));
        cnt += 1;
    };
  };
//   blocks.push(new Block(50,50,50,75,0));
//   blocks.push(new Block(200,200,100,150,1));
//   blocks.push(new Block(400,450,150,100,2));
//   blocks.push(new Block(400,150,50,150,3));
//   blocks.push(new Block(50,450,90,80,4));
//   blocks.push(new Block(400,50,120,40,5));
  frameRate(30); 
  noStroke();
}

function removeItemOnce(arr, value) { 
  var index = arr.indexOf(value);
  if (index > -1) {
      arr.splice(index, 1);
  }
  return arr;
}

function draw() {
  background(10);

  let noBlockSelected = true;
  if(pressed){
    blocks.forEach(function(block){
        block.plannedXY = [0,0];
    });
    for(i = 0; i < (blocks.length); i++){
      let isOver = blocks[i].over();
      if(isOver){
        let b1 = blocks[i];
        let checkedIds = Array.from({length: blocks.length}, (v,w) => w);
        let moveX = mouseX - (b1.xOffset) - b1.x;
        let moveY = mouseY - (b1.yOffset) - b1.y;
        let plan = [clip(moveX, -maxMove, maxMove), clip(moveY, -maxMove, maxMove)];
        hitWall = 0;
        
        checkedIds = removeItemOnce(checkedIds, b1.id);

        hitWall = hitWall + b1.goPlan(plan);
        
        let idNow = b1.id;
        for (u = 0; u < blocks.length; u++){
            if(hitWall == 0){
                idNow = checkNext(idNow,checkedIds,plan);
                if(!idNow){break}
            } else {
                break
            }
        };
        noBlockSelected = false;
        break;
      }
    }
    blocks.forEach(function(block){
        if(hitWall > 0){
            block.goPlan([0,0]);
        }
        block.moveNow();
    }); 
  } 
  if (noBlockSelected) {
    locked = false; 
    lockID = -1;
  }
  blocks.forEach(function(block) {
    block.display();
    block.colorBack();;
  });
}

function checkNext(idNow, checkedIds, plan) {  
    checkedIds.forEach(function(id){
        if(id != idNow){
            let b1 = blocks[idNow];
            let b2 = blocks[id];
            hit = collide(b2.x,b2.y,b2.w,b2.h,b1.x + plan[0], b1.y + plan[1],b1.w,b1.h);
            if(hit){
                hitWall = hitWall + b2.goPlan(plan);
                b2.myColor = b1.myColor;
                if(hitWall == 1){
                    b2.hitColor();
                    return false
                };
                checkNext(b2.id, checkedIds, plan);
                return b2.id;
            }
        }
    })
    return false
}

function touchStarted() {
    pressed = true;
}

function touchEnded() {
    pressed = false;
}

function mousePressed() {
  pressed = true;
}

function mouseReleased(){
  pressed = false;
}

function clip (val, min, max) {
   return Math.min(max, Math.max(min, val));
}

function collide (x, y, w, h, x2, y2, w2, h2) {
  if (x + w >= x2 &&    // r1 right edge past r2 left
      x <= x2 + w2 &&    // r1 left edge past r2 right
      y + h >= y2 &&    // r1 top edge past r2 bottom
      y <= y2 + h2) {    // r1 bottom edge past r2 top
        return true;
  }
  return false;
};

class Block {
  constructor(x,y,w,h,id) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.xOffset = 0;
    this.yOffset = 0;
    this.id = id;
    this.lastXY = [0,0];
    this.plannedXY = [0,0];
    this.myColor = [random(50,255),random(50,255),random(50,255),255];
    this.color = this.myColor;
  }

  goPlan (plan){
    this.plannedXY = plan;
    let newX = this.plannedXY[0] + this.x;
    let newY = this.plannedXY[1] + this.y;
    if(
        (newX + this.w) > (width - maxMove) ||
        (newX) < maxMove ||
        (newY + this.h) > (height - maxMove) || 
        (newY) < maxMove
    ){
        return 1
    } else {
        return 0
    }
  }

  hitColor () {
      this.color = [255,100,100,255];
  }

  colorBack () {
     this.color = this.myColor;
  }

  moveNow() {
    let moveX = this.x + this.plannedXY[0];
    let moveY = this.y + this.plannedXY[1];
    this.x = moveX;//clip(moveX, 0, width - this.w);
    this.y = moveY;//clip(moveY, 0, height - this.h);
  }

  over() {
    if(!locked){
      if (
        mouseX >= this.x &&         // right of the left edge AND
        mouseX <= this.x + this.w &&    // left of the right edge AND
        mouseY >= this.y &&         // below the top AND
        mouseY <= this.y + this.h
        ) {
        this.xOffset = mouseX - this.x;
        this.yOffset = mouseY - this.y;
        locked = true;
        lockID = this.id;
        return true;
      } else {
        return false;
      }
  } else {
    if(lockID == this.id){
      return true;
    } else {
      return false;
    }
  }
  }

  display() {
        fill(this.color);
        rect(this.x, this.y, this.w, this.h);
  }
}