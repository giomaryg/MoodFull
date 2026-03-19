import React, { useEffect, useRef, useState } from 'react';

export default function ThreeBackground() {
  const mountRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
           (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || 
           (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
           /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent) || 
           window.matchMedia('(display-mode: standalone)').matches;
  });

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isLowPerformance = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || 
                               (navigator.deviceMemory && navigator.deviceMemory <= 4);
      const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent) || 
                        window.matchMedia('(display-mode: standalone)').matches;
      setIsMobile(isMobileDevice || isLowPerformance || isWebView);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || !mountRef.current) return;

    let cancel = false;
    let renderer, scene, material, particlesGeo, particlesMat;
    let rings = [];
    let animId;
    let handleResize;

    import('three').then((THREE) => {
      if (cancel) return;
      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      const group = new THREE.Group();
      scene.add(group);

      material = new THREE.MeshBasicMaterial({ 
        color: 0x6b9b76, 
        wireframe: true,
        transparent: true,
        opacity: 0.05
      });

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
      particlesGeo = new THREE.BufferGeometry();
      const particlesCount = 100;
      const posArray = new Float32Array(particlesCount * 3);
      for(let i=0; i<particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
      }
      particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      particlesMat = new THREE.PointsMaterial({
        size: 0.2,
        color: 0x6b9b76,
        transparent: true,
        opacity: 0.2
      });
      const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
      scene.add(particlesMesh);

      camera.position.z = 40;

      const animate = () => {
        if (cancel) return;
        animId = requestAnimationFrame(animate);
        
        if (document.hidden) return;

        group.rotation.y += 0.001;
        group.rotation.x += 0.0005;
        
        particlesMesh.rotation.y -= 0.0005;

        rings.forEach(r => {
          r.mesh.rotation.x += r.rx;
          r.mesh.rotation.y += r.ry;
        });
        renderer.render(scene, camera);
      };

      animate();

      handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);
    }).catch(err => console.error("Failed to load three.js", err));

    return () => {
      cancel = true;
      if (handleResize) window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
      if (mountRef.current && renderer && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (renderer) renderer.dispose();
      if (material) material.dispose();
      if (particlesGeo) particlesGeo.dispose();
      if (particlesMat) particlesMat.dispose();
      rings.forEach(r => {
        if (r.mesh && r.mesh.geometry) r.mesh.geometry.dispose();
      });
      if (scene) scene.clear();
    };
  }, [isMobile]);

  if (isMobile) {
    return (
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#e8f0ea] to-[#fdf8f4]" 
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      />
    );
  }

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />;
}