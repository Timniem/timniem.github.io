
// Theme Toggle
const toggle = document.getElementById("themeToggle");
const sunIcon = toggle.querySelector(".sun-icon");
const moonIcon = toggle.querySelector(".moon-icon");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
    document.body.classList.add("light");
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
}
if (savedTheme === "dark") {
    document.body.classList.add("dark");
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
}

toggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    if (isLight) {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
    } else {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
    }
    localStorage.setItem("theme", isLight ? "light" : "dark");
});

// Tab System
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    tab.classList.add("active");

    const tabId = tab.dataset.tab;

    document.getElementById(tabId).classList.add("active");

    switchVisualization(tabId);
});
});

const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
let targets = [];
let mode = "name";
let time = 0;

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    const height = window.innerWidth < 768 ? 260 : 200;

    canvas.height = height * dpr;


    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y) {
    this.x = x;
    this.y = y;

    this.vx = 0;
    this.vy = 0;

    this.tx = x;
    this.ty = y;

    this.size = 0.25 + Math.random() * 1.4;
    this.phase = Math.random() * Math.PI * 3;
    }

    update() {
    const dx = this.tx - this.x;
    const dy = this.ty - this.y;

    this.vx += dx * 0.0025;
    this.vy += dy * 0.0025;

    this.vx *= 0.92;
    this.vy *= 0.92;

    this.x += this.vx;
    this.y += this.vy;
    }

    draw() {
    const accent = getComputedStyle(document.body)
        .getPropertyValue('--accent')
        .trim();

    const pulse = Math.sin(time * 0.02 + this.phase) * 0.8;

    ctx.beginPath();
    ctx.fillStyle = accent;

    ctx.arc(
        this.x,
        this.y + pulse,
        this.size,
        0,
        Math.PI * 2
    );

    ctx.fill();
    }
}

function createNameTargets() {
    const off = document.createElement("canvas");

    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
    
    off.width = canvasWidth;
    off.height = canvasHeight;

    const octx = off.getContext("2d");

    octx.fillStyle = "white";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    const fontSize = Math.max(Math.min(
        canvasWidth * 0.12,
        canvasHeight * 0.45
        ),40);
    octx.font = `${fontSize}px Montserrat`;

    const text = "Tim Niemeijer";

    const metrics = octx.measureText(text);

    const textHeight =
    metrics.actualBoundingBoxAscent +
    metrics.actualBoundingBoxDescent;

    const y =
    (canvasHeight +
    metrics.actualBoundingBoxAscent -
    metrics.actualBoundingBoxDescent) / 2;

    octx.fillText(text, canvasWidth / 2, y);

    const data = octx.getImageData(
    0,
    0,
    off.width,
    off.height
    ).data;

    targets = [];

    for (let y = 0; y < off.height; y += 4) {
    for (let x = 0; x < off.width; x += 4) {
        const index = (y * off.width + x) * 4;
        if (data[index + 3] > 100) {
        targets.push({
            x: x,
            y: y
        });
        }
    }
    }
}

function createHelixTargets() {
    targets = [];

    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

    const centerY = canvasHeight * 0.5;
    const startX = canvasWidth * 0.12;
    const width = canvasWidth * 1;

    for (let i = 10; i < 400; i++) {
    const t = i / 450;

    const x = startX + t * width;
    const angle = t * Math.PI * 8;

    const yA = centerY + Math.sin(angle) * 30;
    const yB = centerY - Math.sin(angle) * 30;

    targets.push({
        x,
        y: yA
    });

    targets.push({
        x,
        y: yB
    });

    if (i % 12 === 0) {
        for (let s = 0; s <= 1; s += 0.2) {
        targets.push({
            x,
            y: yA * (1 - s) + yB * s
        });
        }
    }
    }
}

function createActivityTargets() {
    targets = [];

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    const points = [
    { x: w * 0.25, y: h * 0.7 },
    { x: w * 0.45, y: h * 0.3 },
    { x: w * 0.65, y: h * 0.6 },
    { x: w * 0.82, y: h * 0.35 }
    ];

    points.forEach(p => {
    for (let a = 0; a < Math.PI * 2; a += 0.15) {
        targets.push({
        x: p.x + Math.cos(a) * 10,
        y: p.y + Math.sin(a) * 10
        });
    }
    });

    for (let i = 0; i < points.length - 1; i++) {
    for (let t = 0; t <= 1; t += 0.03) {
        targets.push({
        x: points[i].x * (1 - t) + points[i + 1].x * t,
        y: points[i].y * (1 - t) + points[i + 1].y * t
        });
    }
    }
}

function createPaperStackTargets() {
    targets = [];

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    const cx = w / 2;
    const cy = h / 2;

    const papers = [
    { x: -25, y: 20 },
    { x: -10, y: 10 },
    { x: 10, y: 0 }
    ];

    papers.forEach(offset => {
    const left = cx - 60 + offset.x;
    const top = cy - 40 + offset.y;
    const width = 120;
    const height = 80;

    // outline
    for (let x = 0; x <= width; x += 4) {
        targets.push({ x: left + x, y: top });
        targets.push({ x: left + x, y: top + height });
    }

    for (let y = 0; y <= height; y += 4) {
        targets.push({ x: left, y: top + y });
        targets.push({ x: left + width, y: top + y });
    }

    // text lines
    for (let row = 0; row < 4; row++) {
        const yy = top + 20 + row * 12;

        for (let x = 15; x < width - 15; x += 5) {
        targets.push({
            x: left + x,
            y: yy
        });
        }
    }

    // folded corner
    for (let i = 0; i < 15; i += 2) {
        targets.push({
        x: left + width - i,
        y: top + i
        });

        targets.push({
        x: left + width - 15,
        y: top + i
        });
    }
    });
}

function assignTargets() {
    particles.forEach((particle, i) => {
    const target = targets[i % targets.length];
    particle.tx = target.x;
    particle.ty = target.y;
    });
}

async function initializeParticles() {
    await document.fonts.ready;

    createNameTargets();

    for (let i = 0; i < Math.max(800, targets.length); i++) {
    particles.push(
        new Particle(
        Math.random() * 200,
        Math.random() * 180
        )
    );
    }

    assignTargets();
    animate();
}

initializeParticles();

function switchVisualization(tabId) {
    mode = tabId;

    switch (tabId) {
    case "bio":
        createNameTargets();
        break;

    case "research":
        createHelixTargets();
        break;

    case "publications":
        createPaperStackTargets();
        break;

    case "activities":
        createActivityTargets();
        break;
    }

    assignTargets();
}

function animate() {
    requestAnimationFrame(animate);

    time++;

    ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
    );

    particles.forEach(p => {
    p.update();
    p.draw();
    });
}

animate();
