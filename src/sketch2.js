let blocks = [];
let locked = false;
let xOffset = 0;
let yOffset = 0;
let pressed = false;
let lockID = -1;
let maxMove = 10;

function setup() {
  createCanvas(600,600);
  blocks.push(new Block(50,50,50,75,0));
  blocks.push(new Block(200,200,100,150,1));
  blocks.push(new Block(400,450,150,100,2));
  blocks.push(new Block(400,150,50,150,3));
  frameRate(30); 
}

function removeItemOnce(arr, value) { 
  var index = arr.indexOf(value);
  if (index > -1) {
      arr.splice(index, 1);
  }
  return arr;
}

function draw() {
  background(100);

  let noBlockSelected = true;
  if(pressed){
    let hitWall = false;
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
        hitWall = b1.goPlan(plan);

        checkedIds = removeItemOnce(checkedIds, b1.id);

        if(!hitWall){
            checkedIds.forEach(function(id){
                let b2 = blocks[id];
                hit = collide(b2.x,b2.y,b2.w,b2.h,b1.x + plan[0], b1.y + plan[1],b1.w,b1.h);
                if(hit){
                    hitWall = b2.goPlan(plan);
                    //checkedIds = removeItemOnce(checkedIds, b2.id);
                    if(!hitWall){
                        checkedIds.forEach(function(id){
                            if(id != b2.id){
                                let b3 = blocks[id];
                                hit = collide(b3.x,b3.y,b3.w,b3.h,b2.x + plan[0],b2.y + plan[1],b2.w,b2.h);
                                if(hit){
                                    hitWall = b3.goPlan(plan);
                                    //checkedIds = removeItemOnce(checkedIds, b3.id);
                                    if(!hitWall){
                                        checkedIds.forEach(function(id){
                                            if(id != b3.id){
                                                let b4 = blocks[id];
                                                hit = collide(b4.x,b4.y,b4.w,b4.h,b3.x + plan[0],b3.y + plan[1],b3.w,b3.h);
                                                if(hit){
                                                    console.log(plan)
                                                    hitWall = b4.goPlan(plan);
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                        })
                    }
                }
            })
        }
        noBlockSelected = false;
        break;
      }
    }
    console.log(hitWall);
    blocks.forEach(function(block){
        if(hitWall){
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
  });
}

function mousePressed() {
  pressed = true;
}

function mouseReleased(){
  pressed = false;
}

function checkCollision(b1,b2,checkedIds){
  let hit = collide(b2.x,b2.y,b2.w,b2.h,b1.x,b1.y,b1.w,b1.h);
  if(hit){
    let colMove = collisionMove(b2.x,b2.y,b2.w,b2.h,b1.x,b1.y,b1.w,b1.h);
    let hitWall;  
    checkIds = removeItemOnce(checkedIds,b1.id);
    checkIds = removeItemOnce(checkedIds,b2.id);
    if(abs(colMove[0]) < abs(colMove[1])){
      hitWall = b2.move(colMove[0], 0)
    } else {
      hitWall = b2.move(0, colMove[1])
    }
    if(!hitWall){
      checkedIds.forEach(function(id){
        let b3 = blocks[id];
        // if(b3.id == b2.id){break}      
          if(checkedIds.length != 0){
            //removeItemOnce(b2.id);
            hitWall = checkCollision(b2, b3, checkedIds);
          }
      })
    }
    return hitWall;
  } else {
      return false}
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
        return true
    } else {
        return false
    }
    // return this.plannedXY
  }

  go(newX, newY) {
    this.lastXY = [this.x, this.y];
    let moveX = clip(newX - (this.xOffset), 0, width - this.w) - this.x;
    let moveY = clip(newY - (this.yOffset), 0, height - this.h) - this.y;
    this.x = this.x + clip(moveX, -6, 6); // maximale geschwindigkeit 20
    this.y = this.y + clip(moveY, -6, 6);
  }
 
  toLast(){
    this.x = this.lastXY[0];
    this.y = this.lastXY[1];
  }

  moveNow() {
    let moveX = this.x + this.plannedXY[0];
    let moveY = this.y + this.plannedXY[1];
    this.x = moveX;//clip(moveX, 0, width - this.w);
    this.y = moveY;//clip(moveY, 0, height - this.h);
  }

  move(newX, newY) {
    let moveX = this.x + newX;
    let moveY = this.y + newY;
    this.x = clip(moveX, 0, width - this.w);
    this.y = clip(moveY, 0, height - this.h);
    if(moveX != this.x || moveY != this.y){
      return true;
    } else {
      return false;
    }
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
    rect(this.x, this.y, this.w, this.h);
  }
}