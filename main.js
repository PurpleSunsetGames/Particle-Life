'use strict';
let mouseInWorld = {x:0,y:0}
let resetButton = document.getElementById("resetButton");
let zoom = 1, offset=[window.innerWidth/2,window.innerHeight/2];
let amount = 2200;
let repulseDist = 15,
    maxDist = 300,
    universalMulti = 1,
    distanceMulti = 2,
    confineToEdges = true,
    skew = .7,
    damp = 1,
    colorAmount = 5,
    repulseForce = 300;

let particleSize = 4;
let colors = [
    "#ffffff",
    "#ff1111",
    "#00ee11",
    "#ffff11",
    "#ff11ff"
]
let colorFunc = 1;
let forceRelations = [];
let mainCanvas = document.getElementById("mainCanvas");
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
        if (x < maxDist - skew*(maxDist - repulseDist)) {
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
            if (Math.abs((this.pos.x + this.vel.x)) >= 500) {
                this.vel.x = -.9*this.vel.x;
            }
            if (Math.abs((this.pos.y + this.vel.y)) >= 250) {
                this.vel.y = -.9*this.vel.y;
            }
        }
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        let sumx = 0;
        let sumy = 0;
        let extradamp = 1;
        for (let i=0; i<particles.length; i++) {
            let element = particles[Number(i)];
            let dist = distance(this.pos, element.pos)*distanceMulti;
            if (i != this.ID && dist < maxDist) {
                if(dist <= repulseDist) {
                    sumx += -(repulseForce / 10000) * (dist - repulseDist)*(this.pos.x - element.pos.x);
                    sumy += -(repulseForce / 10000) * (dist - repulseDist)*(this.pos.y - element.pos.y);
                    extradamp = .8;
                }
                else {
                    let f1 = forceRelations[element.colorID][this.colorID] * universalMulti;
                    let f = this.attr(f1, dist) / 10000;
                    sumx += f*(this.pos.x - element.pos.x);
                    sumy += f*(this.pos.y - element.pos.y);
                }
            }
        }
        this.vel.x = extradamp * damp*(this.vel.x+Number(sumx));
        this.vel.y = extradamp * damp*(this.vel.y+Number(sumy));
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
    ctx.arc(zoom*(Number(x)+offset[0]), zoom*(Number(y)+offset[1]), zoom*particleSize, 0, 2 * Math.PI, true);
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
    if (colorFunc === 1) {
        for (let i=0;i<amount;i++) {
            particles[i] = new particle(
                Math.floor(Math.random() * (colorAmount)), 
                {x: Math.random()*Number(1000)-500, y: Math.random()*Number(500)-250},
                {x: 0, y: 0},
                1,
                i
            )
        }
    }
    else if (colorFunc === 2) {
        for (let i=0;i<amount;i++) {
            let x1 = Math.random()*Number(mainCanvas.width );
            let y1 = Math.random()*Number(mainCanvas.height);
            particles[i] = new particle(
                Math.floor((x1 / mainCanvas.width) * colorAmount), 
                {x: x1, y: y1},
                {x: 0, y: 0},
                1,
                i
            )
        }
    }
}
function genRandomColorForces(n) {
    let temp=[];
    forceRelations.length=0;
    for (let h=0;h<n**2;h++) {
        temp[h] = (Math.random()-.5) * 16;
    }
    for (let w=0;w<n;w++) {
        forceRelations.push(temp.slice(w*n, (w+1)*n));
    }
    console.log(forceRelations);
}
function genPreset1 () {
    forceRelations.length=0;
    forceRelations = [
        [3,-3,-3,-3,-3],
        [4,4,-2,0,0],
        [4,3,10,12,2],
        [-2,-2,23,13,3],
        [-2,-2,-2,18,-1],
    ]
    reset();
}
function genPreset2 () {
    forceRelations.length = 0;
    forceRelations = [
        [18,17,-19, 0],
        [-19,18,17, 0],
        [17,-19,18, 9],
        [-5, -5, -3, 1]
    ]
    colorAmount = 4;
    reset();
}
function genPreset3 () {
    forceRelations.length = 0;
    forceRelations = [
        [1,1,-1,0,0],
        [0,1,1,0,0],
        [0,-1,1,1,0],
        [0,-1,0,1,1],
        [1,0,1,-1,0]
    ]
    repulseDist = 15;
    maxDist = 300;
    universalMulti = 1;
    distanceMulti = 1;
    confineToEdges = true;
    skew = .7;
    damp = 1;
    colorAmount = 5,
    repulseForce = 300;
    colorAmount = 5;
    reset();
}
document.addEventListener("wheel", function(e){
    mouseInWorld = {x:(e.clientX/zoom) - offset[0], y:(e.clientY/zoom) - offset[1]}

    zoom = (zoom-((zoom*e.deltaY)/1000));

    offset[0] = (e.clientX/zoom)-(mouseInWorld.x);
    offset[1] = (e.clientY/zoom)-(mouseInWorld.y);
})
let mouseDown = false;
mainCanvas.addEventListener("mousemove", (e)=>{
    if(mouseDown){
        offset[1] += (e.movementY) / (zoom);
        offset[0] += (e.movementX) / (zoom);
    }
    mouseInWorld = {x:(e.clientX/zoom) - offset[0], y:(e.clientY/zoom) - offset[1]}
})

mainCanvas.addEventListener('mousedown', 
() => {mouseDown = true}
);

window.addEventListener('mouseup', 
() => {mouseDown = false}
);
resetButton.addEventListener("click", reset);
genRandomColorForces(colorAmount);
reset();
run();

