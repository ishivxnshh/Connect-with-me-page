// Three.js background animation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg-canvas'),
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Performance optimization
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const particleCount = isMobile ? 500 : 1000;
const spaceshipCount = isMobile ? 4 : 8;

// Create planets
function createPlanet(radius, color, position, speed) {
    const geometry = new THREE.SphereGeometry(radius, isMobile ? 16 : 32, isMobile ? 16 : 32);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(position.x, position.y, position.z);
    planet.userData = { speed: speed };
    scene.add(planet);
    return planet;
}

const planets = [
    createPlanet(2, 0x4a9eff, { x: -20, y: 10, z: -10 }, 0.02),
    createPlanet(1.5, 0x00ff00, { x: 15, y: -8, z: -15 }, 0.03),
    createPlanet(1, 0xff0000, { x: 0, y: 15, z: -20 }, 0.01)
];

// Create spaceships
function createSpaceship() {
    const group = new THREE.Group();
    
    // Main body
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1.5, isMobile ? 8 : 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a9eff,
        emissive: 0x4a9eff,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    group.add(body);
    
    // Wings
    const wingGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.5);
    const wingMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a9eff,
        emissive: 0x4a9eff,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8
    });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.y = 0.1;
    group.add(wings);
    
    // Engine glow
    const engineGeometry = new THREE.SphereGeometry(0.2, isMobile ? 8 : 16, isMobile ? 8 : 16);
    const engineMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.8
    });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.z = -0.8;
    group.add(engine);
    
    // Random position
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 100;
    group.position.set(x, y, z);
    
    // Random direction
    group.userData = {
        direction: new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ).normalize(),
        speed: 0.3 + Math.random() * 0.2
    };
    
    scene.add(group);
    return group;
}

const spaceships = Array(spaceshipCount).fill().map(createSpaceship);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

// Add point lights
const pointLight1 = new THREE.PointLight(0x4a9eff, 1);
pointLight1.position.set(5, 5, 5);
const pointLight2 = new THREE.PointLight(0x00ff00, 0.5);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight1, pointLight2);

// Create grid
const gridHelper = new THREE.GridHelper(200, isMobile ? 25 : 50, 0x4a9eff, 0x4a9eff);
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.05;
scene.add(gridHelper);

// Create particles
const particlesGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(particleCount * 3);

for(let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.01,
    color: '#4a9eff',
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Mouse movement effect
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
});

// Touch movement effect
document.addEventListener('touchmove', (event) => {
    mouseX = event.touches[0].clientX / window.innerWidth - 0.5;
    mouseY = event.touches[0].clientY / window.innerHeight - 0.5;
});

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Smooth camera movement
    targetX = mouseX * 2;
    targetY = -mouseY * 2;
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;

    // Rotate planets
    planets.forEach(planet => {
        planet.rotation.y += planet.userData.speed;
        planet.rotation.x += planet.userData.speed * 0.5;
    });

    // Move spaceships
    spaceships.forEach(ship => {
        ship.position.add(ship.userData.direction.multiplyScalar(ship.userData.speed));
        
        // Reset position if ship goes too far
        if (Math.abs(ship.position.x) > 50 || 
            Math.abs(ship.position.y) > 50 || 
            Math.abs(ship.position.z) > 50) {
            ship.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            );
            ship.userData.direction = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize();
        }
        
        // Rotate ship to face direction
        ship.lookAt(
            ship.position.x + ship.userData.direction.x,
            ship.position.y + ship.userData.direction.y,
            ship.position.z + ship.userData.direction.z
        );
    });

    // Rotate particles
    particlesMesh.rotation.x += 0.0001;
    particlesMesh.rotation.y += 0.0001;

    // Grid animation
    gridHelper.rotation.x += 0.0002;
    gridHelper.rotation.y += 0.0002;

    renderer.render(scene, camera);
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }, 250);
});

animate(); 