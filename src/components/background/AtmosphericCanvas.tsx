import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

export const AtmosphericCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = mediaQuery.matches;

    // Scene setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Color palette based on theme
    const isDark = theme === 'dark';

    // Ambient and point lights
    const ambientLight = new THREE.AmbientLight(
      isDark ? 0x22242a : 0xf0efe9,
      isDark ? 1.2 : 1.8
    );
    scene.add(ambientLight);

    // Subtle Google colored lights
    const blueLight = new THREE.PointLight(0x4285f4, isDark ? 1.8 : 0.9, 50);
    blueLight.position.set(-15, 10, 10);
    scene.add(blueLight);

    const yellowLight = new THREE.PointLight(0xfbbc05, isDark ? 1.2 : 0.6, 50);
    yellowLight.position.set(15, -8, 8);
    scene.add(yellowLight);

    const greenLight = new THREE.PointLight(0x34a853, isDark ? 1.0 : 0.5, 40);
    greenLight.position.set(10, 12, 5);
    scene.add(greenLight);

    // Soft drifting volumetric particles (clouds/atmosphere)
    const particleCount = prefersReducedMotion ? 40 : 120;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);

    const googlePalette = [
      new THREE.Color(0x4285f4), // Blue
      new THREE.Color(0xea4335), // Red
      new THREE.Color(0xfbbc05), // Yellow
      new THREE.Color(0x34a853), // Green
      new THREE.Color(isDark ? 0x606570 : 0xd8d6cf), // Neutral tint
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      scales[i] = Math.random() * 2 + 1;

      // Select predominantly neutral with occasional subtle Google accents
      const color = googlePalette[i % googlePalette.length];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite using procedural canvas texture
    const createParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.08)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: isDark ? 1.6 : 1.4,
      map: createParticleTexture(),
      transparent: true,
      opacity: isDark ? 0.45 : 0.3,
      vertexColors: true,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Subtle floating translucent shapes (cloud-like orbs with glass feel)
    const floatingGroup = new THREE.Group();
    const orbGeometries: THREE.BufferGeometry[] = [];
    const orbMaterials: THREE.Material[] = [];

    const orbData = [
      { pos: [-12, 6, -5], radius: 3.2, color: 0x4285f4, opacity: isDark ? 0.12 : 0.07 },
      { pos: [14, -5, -8], radius: 4.0, color: 0xfbbc05, opacity: isDark ? 0.09 : 0.05 },
      { pos: [-8, -8, -6], radius: 2.8, color: 0x34a853, opacity: isDark ? 0.1 : 0.06 },
      { pos: [10, 8, -4], radius: 3.0, color: 0xea4335, opacity: isDark ? 0.11 : 0.06 },
      { pos: [0, -10, -10], radius: 5.5, color: isDark ? 0x202430 : 0xeae6dc, opacity: 0.15 },
    ];

    orbData.forEach((data) => {
      const geom = new THREE.SphereGeometry(data.radius, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: data.color,
        transparent: true,
        opacity: data.opacity,
        roughness: 0.4,
        metalness: 0.1,
      });
      orbGeometries.push(geom);
      orbMaterials.push(mat);

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);
      floatingGroup.add(mesh);
    });

    scene.add(floatingGroup);

    // Mouse parallax tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize -1 to 1
      targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth mouse parallax damping
        currentMouseX += (targetMouseX - currentMouseX) * 0.04;
        currentMouseY += (targetMouseY - currentMouseY) * 0.04;

        camera.position.x = currentMouseX * 1.5;
        camera.position.y = currentMouseY * 1.0;
        camera.lookAt(0, 0, 0);

        // Very slow drifting of particles
        particles.rotation.y = elapsedTime * 0.015;
        particles.rotation.x = Math.sin(elapsedTime * 0.01) * 0.02;

        // Gentle floating movement for orbs
        floatingGroup.children.forEach((child, index) => {
          child.position.y += Math.sin(elapsedTime * 0.4 + index) * 0.003;
          child.rotation.y += 0.001;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      orbGeometries.forEach((g) => g.dispose());
      orbMaterials.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="atmospheric-canvas-container"
      aria-hidden="true"
    />
  );
};
