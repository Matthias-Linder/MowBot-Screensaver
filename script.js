const canvas = document.getElementById("mainCanvas");
const body = document.getElementById("body");

canvas.style.opacity = 1;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 10;

var mowerImage = new Image();
mowerImage.src = "resources/mower.png";

var stationImage = new Image();
stationImage.src = "resources/station.png";

var c = canvas.getContext("2d");

let displayStation = true;
let simulateCharging = false;

class Mower {
  constructor(width, height, image, speed, turningSpeed) {
    this.width = width;
    this.height = height;
    this.image = image;
    this.speed = speed;
    this.turningSpeed = turningSpeed;
  }
  posX = canvas.width / 2;
  posY = canvas.height / 2;
  angle = (0 * Math.PI) / 180;
  backtracking = false;
  driving = true;
  backtrackSteps = 0;
  backtrackThreshold = 100;
  turning = false;
  hitbox = 70;
  randomAngle = 0;
  searching = false;
  parkAligning = false;
  parkDrive = false;
  parked = false;
  startDrive = false;
  chargeCounter = 0;
  chargingThreshold = 10000;
  chargeParking = false;

  goForward() {
    this.posX += this.speed * Math.cos(this.angle);
    this.posY += this.speed * Math.sin(this.angle);
    if(simulateCharging && displayStation){
      this.chargeCounter += this.speed;
    }
  }
  goBackward() {
    this.posX -= this.speed * Math.cos(this.angle);
    this.posY -= this.speed * Math.sin(this.angle);
    if(simulateCharging && displayStation){
      this.chargeCounter += this.speed;
    }
  }

  parkAlign() {
    while (this.angle >= 2 * Math.PI) {
      this.angle -= 2 * Math.PI;
    }
    while (this.angle <= -2 * Math.PI) {
      this.angle += 2 * Math.PI;
    }
    if (Math.abs(this.angle - (180 * Math.PI) / 180) <= this.turningSpeed * 1.5) {
      this.angle = Math.PI;
      this.parkAligning = false;
      this.parkDrive = true;
    }
    if (this.angle <= Math.PI) {
      this.angle += this.turningSpeed;
    }
    if (this.angle >= Math.PI) {
      this.angle -= this.turningSpeed;
    }
  }

  newRandomAngle() {
    let angleValid = false;
    while (!angleValid) {
      this.randomAngle = (Math.random() * (180 * Math.PI)) / 150;
      if (Math.random() <= 0.5) {
        this.randomAngle = this.randomAngle * -1;
      }
      if (
        this.randomAngle >= (20 * Math.PI) / 180 ||
        this.randomAngle <= (-45 * Math.PI) / 180
      ) {
        angleValid = true;
      }
    }
  }
}

class Station {
  constructor(height, width, image) {
    this.height = height;
    this.width = width;
    this.image = image;
  }
  XparkOffset = 30;
}

class StationMenu {
  constructor(posX, posY) {
    this.posX = posX;
    this.posY = posY;
  }
  visible = false;
  btnText = "park";
  draw(ctx) {
    if (this.visible) {
      ctx.fillStyle = "gray";
      ctx.fillRect(this.posX, this.posY, 300, 120);
      ctx.fillStyle = "black";
      ctx.font = "40px arial";
      ctx.fillText("Station", this.posX + 90, this.posY + 35);

      if (this.btnText == "park") {
        ctx.fillStyle = "red";
        ctx.fillRect(this.posX + 40, this.posY + 50, 220, 50);
        ctx.fillStyle = "black";
        ctx.font = "40px arial";
        ctx.fillText(this.btnText, this.posX + 110, this.posY + 90);
      }
      if (this.btnText == "searching...") {
        ctx.fillStyle = "orange";
        ctx.fillRect(this.posX + 40, this.posY + 50, 220, 50);
        ctx.fillStyle = "black";
        ctx.font = "40px arial";
        ctx.fillText(this.btnText, this.posX + 50, this.posY + 90);
      }
      if (this.btnText == "start") {
        ctx.fillStyle = "green";
        ctx.fillRect(this.posX + 40, this.posY + 50, 220, 50);
        ctx.fillStyle = "black";
        ctx.font = "40px arial";
        ctx.fillText(this.btnText, this.posX + 110, this.posY + 90);
      }
      if(this.btnText == "charging..."){
        ctx.fillStyle = "blue";
        ctx.fillRect(this.posX + 40, this.posY + 50, 220, 50);
        ctx.fillStyle = "black";
        ctx.font = "40px arial";
        ctx.fillText(this.btnText, this.posX + 50, this.posY + 90);
      }
    }
  }
}
let station = new Station(120, 150, stationImage);

let mower = new Mower(140, 100, mowerImage, 1, 0.01);

let menu = new StationMenu(20, canvas.height / 2 + station.height);

canvas.addEventListener(
  "click",
  function (event) {
    let x = event.pageX;
    let y = event.pageY;
    if (
      x <= station.width &&
      y >= canvas.height / 2 - station.height / 2 &&
      y <= canvas.height / 2 + station.height / 2 &&
      displayStation
    ) {
      menu.visible = !menu.visible;
    }
    if (
      x >= menu.posX + 40 &&
      x <= menu.posX + 260 &&
      y >= menu.posY + 50 &&
      y <= menu.posY + 100 &&
      menu.visible
    ) {
      if (menu.btnText === "park") {
        menu.btnText = "searching..."
        mower.searching = true;
      }
      if (menu.btnText === "start") {
        mower.startDrive = true;
      }
    }
  },
  false
);

let loop = function () {
  update();
  repaint();
  setTimeout(loop, 10);
};

loop();

function update() {
  if(mower.chargeCounter >= mower.chargingThreshold && !mower.chargeParking){
    menu.btnText = "searching...";
    mower.searching = true;
    mower.chargeParking = true;

  }
  if(mower.parked && mower.chargeParking){
    menu.btnText = "charging...";
    mower.chargeCounter -= mower.speed * 3;
    if(mower.chargeCounter <= 0){
      mower.chargeCounter = 0;
      mower.startDrive = true;
      mower.chargeParking = false;
    }
  }
  if (mower.searching && Math.abs(mower.posY - canvas.height / 2) <= mower.speed + 1) {
    mower.posY = canvas.height / 2;
    mower.driving = false;
    mower.parkAligning = true;
  }
  if (mower.parkAligning) {
    mower.parkAlign();
  }
  if (mower.parkDrive) {
    mower.goForward();
    if (mower.posX <= mower.width / 2 + station.XparkOffset) {
      mower.posX = mower.width / 2 + station.XparkOffset;
      mower.parked = true;
      mower.searching = false;
      mower.parkDrive = false;
      menu.btnText = "start";
    }
  }

  if(mower.startDrive){
    mower.parked = false;
    mower.goBackward()
    mower.backtrackSteps++;
    if (mower.backtrackSteps >= mower.backtrackThreshold / mower.speed) {
      mower.backtracking = false;
      mower.startDrive = false;
      mower.backtrackSteps = 0;
      mower.turning = true;
      menu.btnText = "park";
      mower.newRandomAngle();
    }
  }
  if (mower.driving) {
    mower.goForward();
  }
  if (mower.backtracking) {
    mower.goBackward();
    mower.backtrackSteps++;
    if (mower.backtrackSteps >= mower.backtrackThreshold / mower.speed) {
      mower.backtracking = false;
      mower.backtrackSteps = 0;
      mower.turning = true;
      mower.newRandomAngle();
    }
  }
  if (mower.turning) {
    mower.chargeCounter += mower.speed;
    if (mower.randomAngle >= 0) {
      mower.angle += mower.turningSpeed;
      mower.randomAngle -= mower.turningSpeed;
    }
    if (mower.randomAngle < 0) {
      mower.angle -= mower.turningSpeed;
      mower.randomAngle += mower.turningSpeed;
    }

    if (
      mower.randomAngle <= mower.turningSpeed &&
      mower.randomAngle >= -mower.turningSpeed
    ) {
      mower.turning = false;
      mower.driving = true;
    }
  }
  if(displayStation){
    if (
      !(mower.parkDrive || mower.parked)&&
      (mower.posX + mower.hitbox >= canvas.width ||
        mower.posY + mower.hitbox >= canvas.height ||
        mower.posX - mower.hitbox <= station.width - 50 ||
        mower.posY - mower.hitbox <= 0) 
    ) {
      mower.backtracking = true;
      mower.driving = false;
    }
  }
  if(!displayStation){
    if (
      !(mower.parkDrive || mower.parked) &&
      (mower.posX + mower.hitbox >= canvas.width ||
        mower.posY + mower.hitbox >= canvas.height ||
        mower.posX - mower.hitbox <= 0 ||
        mower.posY - mower.hitbox <= 0) 
    ) {
      mower.backtracking = true;
      mower.driving = false;
    }
  }

  //self check
  if(mower.posx <= -canvas.width || mower.posX >= canvas.width * 2 || mower.posY <= -canvas.height || mower.posY >= canvas.height * 2){
    console.error('AutoMower "mowie" left its working area. Brought him back to the garden!');
    mower.posY = canvas.height / 2;
    mower.posX = canvas.width / 2;
  }
}

function repaint() {
  c.clearRect(0, 0, canvas.width, canvas.height);
  if(displayStation){
    c.drawImage(
      station.image,
      0,
      canvas.height / 2 - station.height / 2,
      station.width,
      station.height
    );
  }
  c.translate(mower.posX, mower.posY);
  c.rotate(mower.angle);
  c.drawImage(
    mower.image,
    -mower.width / 2,
    -mower.height / 2,
    mower.width,
    mower.height
  );
  c.rotate(-mower.angle);
  c.translate(-mower.posX, -mower.posY);

  menu.draw(c);
}

//Lively Property Listener
function livelyPropertyListener(name, val)
{
    if(name =="mowerSpeed")
    {
      mower.speed = val;
      mower.turningSpeed = val * 0.01;
    }
    else if(name =="displayStation")
    {
      displayStation = val;
      if(val == false){
        if(mower.parked){
          mower.startDrive = true;
        }
        menu.visible = false;
      }
    }
    else if(name == "simulateCharging"){
      simulateCharging = val;
    }
    else if(name == "batteryCapacity"){
      if(val == 0){
        mower.chargingThreshold = mower.speed * 50;
      }
      else if(val == 1){
        mower.chargingThreshold = mower.speed * 100;
      }
      else if(val == 2){
        mower.chargingThreshold = mower.speed * 300;
      }
    }
    else if(name == "grass"){
      canvas.style.backgroundImage = "url('" + val + "')";
      body.style.backgroundImage = "url('" + val + "')";
    }
    else if(name == "grassSize"){
      canvas.style.backgroundSize = val + "px";
      body.style.backgroundSize = val + "px";
      console.warn(val);
    }
}
