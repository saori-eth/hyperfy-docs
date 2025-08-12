'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function VRMBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.5, 4);
    camera.lookAt(0, 1, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Soft ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Directional light for subtle shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(1, 2, 1);
    scene.add(directionalLight);

    // Load VRM
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    let vrm: any = null;
    
    loader.load(
      '/avatar.vrm',
      (gltf) => {
        vrm = gltf.userData.vrm;
        
        // Rotate model to face camera
        VRMUtils.rotateVRM0(vrm);
        
        // Apply wireframe to all meshes
        vrm.scene.traverse((object: any) => {
          if (object.isMesh) {
            // Create wireframe material
            const wireframeMaterial = new THREE.MeshBasicMaterial({
              color: 0x6b7280, // Gray color
              wireframe: true,
              opacity: 0.15,
              transparent: true,
            });
            
            // Keep original material for subtle shading
            const originalMaterial = new THREE.MeshPhongMaterial({
              color: 0x9ca3af,
              opacity: 0.05,
              transparent: true,
            });
            
            // Apply both materials
            object.material = [originalMaterial, wireframeMaterial];
            
            // Add wireframe geometry
            const wireframeGeometry = new THREE.WireframeGeometry(object.geometry);
            const wireframeMesh = new THREE.LineSegments(
              wireframeGeometry,
              new THREE.LineBasicMaterial({
                color: 0x6b7280,
                opacity: 0.1,
                transparent: true,
              })
            );
            object.add(wireframeMesh);
          }
        });
        
        scene.add(vrm.scene);
      },
      (progress) => {
        console.log('Loading VRM...', (progress.loaded / progress.total) * 100, '%');
      },
      (error) => {
        console.error('Error loading VRM:', error);
      }
    );

    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      
      // Slow rotation
      if (vrm) {
        vrm.scene.rotation.y += delta * 0.1;
        
        // Subtle floating animation
        vrm.scene.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 -z-10 opacity-30 dark:opacity-20"
      style={{ pointerEvents: 'none' }}
    />
  );
}