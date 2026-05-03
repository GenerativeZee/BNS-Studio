document.addEventListener('DOMContentLoaded', () => {
    // Hero Three.js Animation
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        initHeroAnimation();
    }

    function initHeroAnimation() {
        const container = document.getElementById('hero-canvas-container');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });

        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Camera positioning (Cinematic start)
        camera.position.set(12, 6, 18);
        camera.lookAt(0, 1, 0);

        // Architecture Group
        const architecture = new THREE.Group();
        scene.add(architecture);

        // Atmosphere: Subtle Dust Particles
        const particlesCount = 200;
        const positions = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 20;
        }
        const particlesGeom = new THREE.BufferGeometry();
        particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMat = new THREE.PointsMaterial({ color: 0xBFA175, size: 0.02, transparent: true, opacity: 0.2 });
        const particles = new THREE.Points(particlesGeom, particlesMat);
        scene.add(particles);

        // Grid (Blueprint feel)
        const grid = new THREE.GridHelper(20, 20, 0x1A1C20, 0x1A1C20);
        grid.material.transparent = true;
        grid.material.opacity = 0;
        scene.add(grid);

        // Advanced Architectural Structure (Minimalist Modern Villa)
        // Components: { type: 'concrete'|'wood'|'glass', pos, scale, assemblyDelay }
        const components = [
            { id: 'floor', type: 'concrete', pos: [0, -0.05, 0], scale: [8, 0.1, 6], delay: 0 },
            { id: 'wall1', type: 'concrete', pos: [-3.5, 1.5, 0], scale: [0.2, 3, 4], delay: 2 },
            { id: 'wall2', type: 'concrete', pos: [0, 1.5, -2.5], scale: [5, 3, 0.2], delay: 2.5 },
            { id: 'roof1', type: 'concrete', pos: [-1, 3.1, 0], scale: [6, 0.1, 5], delay: 4 },
            { id: 'wood_panel', type: 'wood', pos: [1.5, 1.5, -2.4], scale: [2, 3, 0.1], delay: 5 },
            { id: 'glass_front', type: 'glass', pos: [0.5, 1.5, 1], scale: [6, 3, 0.05], delay: 6 },
            { id: 'cantilever', type: 'concrete', pos: [3, 2.5, 1.5], scale: [3, 0.1, 3], delay: 7 }
        ];

        const partGroups = [];

        components.forEach(c => {
            const group = new THREE.Group();
            const geometry = new THREE.BoxGeometry(c.scale[0], c.scale[1], c.scale[2]);
            
            // Wireframe / Edges
            const edges = new THREE.EdgesGeometry(geometry);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x1A1C20, transparent: true, opacity: 0 });
            const line = new THREE.LineSegments(edges, lineMat);
            group.add(line);

            // Solid Mesh
            let color = 0xF7F7F5; // Concrete
            let opacity = 0;
            let trans = true;
            if (c.type === 'wood') color = 0xD8CFC4;
            if (c.type === 'glass') {
                color = 0xCCDDEE;
                opacity = 0;
            }

            const meshMat = new THREE.MeshPhongMaterial({ 
                color: color, 
                transparent: true, 
                opacity: 0,
                shininess: c.type === 'glass' ? 100 : 10
            });
            const mesh = new THREE.Mesh(geometry, meshMat);
            group.add(mesh);

            group.position.set(c.pos[0], c.pos[1] + 5, c.pos[2]); // Start high for assembly
            architecture.add(group);

            partGroups.push({ 
                group, 
                line, 
                mesh, 
                targetPos: new THREE.Vector3(...c.pos),
                delay: c.delay 
            });
        });

        // Lights (Cinematic Setup)
        const ambLight = new THREE.AmbientLight(0xffffff, 0);
        scene.add(ambLight);

        const spotLight = new THREE.SpotLight(0xffffff, 0);
        spotLight.position.set(15, 20, 10);
        spotLight.castShadow = true;
        scene.add(spotLight);

        const fillLight = new THREE.PointLight(0xBFA175, 0); // Warm fill
        fillLight.position.set(-10, 5, -5);
        scene.add(fillLight);

        let startTime = Date.now();
        
        function animate() {
            const elapsed = (Date.now() - startTime) / 1000;
            requestAnimationFrame(animate);

            // Cinematic Camera Drift
            camera.position.x = 12 + Math.cos(elapsed * 0.1) * 1;
            camera.position.z = 18 + Math.sin(elapsed * 0.1) * 1;
            camera.lookAt(0, 1, 0);

            // Atmospheric Micro-motion
            particles.rotation.y += 0.001;
            particles.position.y = Math.sin(elapsed * 0.5) * 0.1;

            // Blueprint Grid Reveal
            if (elapsed < 3) {
                grid.material.opacity = Math.min(elapsed / 3, 0.1);
            }

            // Assembly & Materialization Logic
            partGroups.forEach(p => {
                if (elapsed > p.delay) {
                    const t = Math.min((elapsed - p.delay) / 3, 1); // 3s transition per part
                    const eased = 1 - Math.pow(1 - t, 3); // Ease out cubic

                    // Assembly: Move from sky to target
                    p.group.position.y = p.targetPos.y + (5 * (1 - eased));
                    
                    // Blueprint/Wireframe phase
                    p.line.material.opacity = (t < 0.5) ? (t * 0.4) : (0.2 * (1 - (t-0.5)*2));
                    
                    // Materialization phase
                    p.mesh.material.opacity = (t > 0.3) ? Math.min((t - 0.3) * 1.5, (components.find(c => c.pos[0] === p.targetPos.x).type === 'glass' ? 0.3 : 0.95)) : 0;
                }
            });

            // Lighting Reveal (Phase 4-5)
            if (elapsed > 4) {
                ambLight.intensity = Math.min((elapsed - 4) / 6, 0.5);
                spotLight.intensity = Math.min((elapsed - 4) / 6, 0.8);
                fillLight.intensity = Math.min((elapsed - 4) / 6, 0.3);
            }

            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // Mouse Parallax (Very Subtle)
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            architecture.rotation.y = x * 0.05;
            architecture.rotation.x = y * 0.02;
        });
    }

    // Navbar scroll effect
    const nav = document.querySelector('nav');
    const hasHero = document.querySelector('.hero');
    
    const handleScroll = () => {
        if (hasHero) {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        } else {
            nav.classList.add('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 

    // Reveal animations on scroll
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
