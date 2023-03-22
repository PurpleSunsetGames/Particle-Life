'use strict';

let resetButton = document.getElementById("resetButton");

let amount = 400;
let particleSize = 3;
let repulseDist = 20,
    maxDist = 70,
    universalMulti = 1,
    distanceMulti = 1,
    confineToEdges = true,
    skew = .9,
    damp = .98;
let colors = [
    "#ffffff",
    "#ff1111",
    "#00ee11"
]
let forceRelations = [
    [3, 2, 0],
    [-1, 3, 2],
    [2, -1, 3],
];
let mainCanvas = document.getElementById("mainCanvas");
console.log(mainCanvas);
let mainCanvasCTX = mainCanvas.getContext("2d");
mainCanvas.style.width = String(window.innerWidth - 20) + 'px';
mainCanvas.style.height = String(window.innerHeight - 20) + 'px';
mainCanvas.width = window.innerWidth - 20;
mainCanvas.height = window.innerHeight - 20;

class particle {
    constructor(colorID, pos, vel, mass, ID){
        this.color = colors[colorID];
        this.colorID = colorID;
        this.ID = ID;
        if ((Object.keys(pos).length != 2) || (Object.keys(vel).length != 2)) {
            throw new Error("Incorrect dimension of input");
        }
        else {
            this.pos = pos;
            this.vel = vel;
            this.mass = mass;
        }
    }
    attr(forceFactor, x) {
        if (x < repulseDist) {
            return -5 * (x - repulseDist);
        }
        else if (x < maxDist - skew*(maxDist - repulseDist)) {
            return (forceFactor * (x - repulseDist)) / (2*(1-skew)*(maxDist - repulseDist));
        }
        else if (x < maxDist) {
            return -(forceFactor * (x - repulseDist)) / (2*skew*(maxDist - repulseDist));
        }
        else {
            return 0;
        }
    }
    drawSelf() {
        point(this.pos.x, this.pos.y, mainCanvasCTX, String(this.color));
    }
    calcSelf() {
        if (confineToEdges) {
            if (Math.abs((this.pos.x + this.vel.x)-mainCanvas.width/2) >= mainCanvas.width/2) {
                this.vel.x = -.9*this.vel.x;
            }
            if (Math.abs((this.pos.y + this.vel.y)-mainCanvas.height/2) >= mainCanvas.height/2) {
                this.vel.y = -.9*this.vel.y;
            }
        }
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        let sumx = 0;
        let sumy = 0;
        for (let i=0; i<particles.length; i++) {
            if (i != this.ID) {
                let element = particles[Number(i)];
                let f1 = forceRelations[element.colorID][this.colorID] * universalMulti;
                let f = this.attr(f1, distance(this.pos, element.pos)*distanceMulti) / 10000;
                sumx += f*(this.pos.x - element.pos.x);
                sumy += f*(this.pos.y - element.pos.y);
            }
        }
        this.vel.x = damp*(this.vel.x+Number(sumx));
        this.vel.y = damp*(this.vel.y+Number(sumy));
    }
}
function distance(p1, p2) {
    let a = (Number(p1.x - p2.x))**2;
    let b = (Number(p1.y - p2.y))**2;
    let r = Number(Math.sqrt(a+b));
    if (isNaN(r)) {
        throw("NANANANANA");
    }
    else {
        return r;
    }
}
function genRandomColor(){
    return Math.floor(Math.random()*2**24).toString(16).padStart(6, '0');
}
function point(x, y, ctx, color){
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(Number(x), Number(y), particleSize, 0, 2 * Math.PI, true);
    ctx.fill();
}

let a;
function run() {
    mainCanvas.style.width = String(window.innerWidth - 20) + 'px';
    mainCanvas.style.height = String(window.innerHeight - 20) + 'px';
    mainCanvas.width = window.innerWidth - 20;
    mainCanvas.height = window.innerHeight - 20;
    mainCanvasCTX.fillStyle = "black";
    mainCanvasCTX.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    for (let i=0;i<Object.keys(particles).length;i++) {
        a = particles[i];
        a.calcSelf();
        a.drawSelf();
    }
    requestAnimationFrame(run);
}

let particles = [];

function reset() {
    particles.length = 0;
    for (let i=0;i<amount;i++) {
        particles[i] = new particle(
            Math.floor(Math.random() * (Object.keys(colors).length)), 
            {x: Math.random()*Number(mainCanvas.width), y: Math.random()*Number(mainCanvas.height)},
            {x: 0, y: 0},
            1,
            i
        )
    }
}

resetButton.addEventListener("click",
    reset
);
reset();
run();

