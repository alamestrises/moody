// --- 1. Init Lenis Smooth Scroll ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- 2. Register GSAP Plugins ---
gsap.registerPlugin(ScrollTrigger);

// Link GSAP to Lenis
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
});
gsap.ticker.lagSmoothing(0, 0);

// --- 3. Hero Animations ---
const tlHero = gsap.timeline();

tlHero.from('.hero-subtitle', {
    y: 20,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    delay: 0.5
})
    .from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
    }, "-=0.8")
    .from('.hero-cta', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=0.8")
    .from('.hero-scroll', {
        opacity: 0,
        duration: 1
    }, "-=0.5");


// --- 4. Showcase Animations ---
gsap.from('.section-header', {
    scrollTrigger: {
        trigger: '#showcase',
        start: 'top 80%',
    },
    y: 50,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
});

gsap.utils.toArray('.product-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
        },
        y: 100,
        opacity: 0,
        duration: 1,
        delay: i * 0.2,
        ease: "power3.out"
    });
});

// --- 5. Lifestyle Parallax ---
gsap.to('.lifestyle-bg', {
    scrollTrigger: {
        trigger: '#lifestyle',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
    },
    y: 200,
    ease: "none"
});

gsap.from('.lifestyle-text-bg', {
    scrollTrigger: {
        trigger: '#lifestyle',
        start: 'top center',
        end: 'bottom center',
        scrub: true
    },
    scale: 0.8,
    opacity: 0.2,
    ease: "none"
});

// --- 6. Tech Section ---
gsap.from('.feature-item', {
    scrollTrigger: {
        trigger: '.tech-content',
        start: 'top 70%',
    },
    x: -50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out"
});

gsap.from('.tech-visual', {
    scrollTrigger: {
        trigger: '.tech-content',
        start: 'top 70%',
    },
    x: 50,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
});

// --- 7. Three.js Background (Abstract Particles) ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Função para gerar a textura de estrela de 4 pontas dinamicamente
function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const cx = 64;
    const cy = 64;
    const r = 48; // Raio da estrela, deixando margem para o glow não cortar nas bordas

    // Desenhar um brilho sutil ao redor da estrela
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 14;

    ctx.fillStyle = '#ffffff'; // Branco puro para ser colorido pelo PointsMaterial do Three.js
    ctx.beginPath();
    
    // Começa na ponta superior
    ctx.moveTo(cx, cy - r);
    // Curva até a ponta direita, suavizando para dentro em direção ao centro (cx, cy)
    ctx.quadraticCurveTo(cx, cy, cx + r, cy);
    // Curva até a ponta inferior
    ctx.quadraticCurveTo(cx, cy, cx, cy + r);
    // Curva até a ponta esquerda
    ctx.quadraticCurveTo(cx, cy, cx - r, cy);
    // Curva de volta à ponta superior
    ctx.quadraticCurveTo(cx, cy, cx, cy - r);
    
    ctx.closePath();
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
}

const starTexture = createStarTexture();

// Create Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    // Spread particles across a wide area
    posArray[i] = (Math.random() - 0.5) * 15;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Material de estrelas de alta fidelidade
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.45,
    color: '#5C948B', // Cor de destaque da marca
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    map: starTexture,
    depthWrite: false
});

// Mesh
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

camera.position.z = 3;

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
});

// Scroll Interaction for Three.js
let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Rotate particles slowly
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;

    // Ease mouse movement
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;

    particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
    particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

    // Move particles based on scroll
    particlesMesh.position.y = scrollY * -0.001;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
