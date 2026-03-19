import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isLowPerformance = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || 
                               (navigator.deviceMemory && navigator.deviceMemory <= 4);
      setIsMobile(isMobileDevice || isLowPerformance);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || !mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const material = new THREE.MeshBasicMaterial({ 
      color: 0x6b9b76, 
      wireframe: true,
      transparent: true,
      opacity: 0.05
    });

    const rings = [];
    for(let i=0; i<4; i++) {
      const geometry = new THREE.TorusGeometry(12 + i*8, 0.2, 16, 100);
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      group.add(ring);
      rings.push({
        mesh: ring,
        rx: (Math.random() - 0.5) * 0.003,
        ry: (Math.random() - 0.5) * 0.003,
      });
    }

    // Add some floating particles
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 100;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i<particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x6b9b76,
      transparent: true,
      opacity: 0.2
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    camera.position.z = 40;

    const animate = () => {
      requestAnimationFrame(animate);
      group.rotation.y += 0.001;
      group.rotation.x += 0.0005;
      
      particlesMesh.rotation.y -= 0.0005;

      rings.forEach(r => {
        r.mesh.rotation.x += r.rx;
        r.mesh.rotation.y += r.ry;
      });
      renderer.render(scene, camera);
    };

    const animId = requestAnimationFrame(animate);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      material.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, [isMobile]);

  if (isMobile) {
    return <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#e8f0ea] to-[#fdf8f4]" />;
  }

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />;
}