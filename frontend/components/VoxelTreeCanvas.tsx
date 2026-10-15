'use client';

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react';
import * as THREE from 'three';
import {
  getStaticTreeVoxels,
  getModuleFoliageClusters,
  VOXEL_PALETTE,
  VoxelCoord
} from '../lib/voxelTreeData';

export interface VoxelTreeCanvasHandle {
  resetCamera: () => void;
}

interface VoxelTreeCanvasProps {
  selectedModules: Record<string, { enabled: boolean; version?: string }>;
  reducedMotion?: boolean;
  resetSignal?: number;
}

interface AnimatedVoxelInstance {
  baseCoord: VoxelCoord;
  moduleId: string;
  categoryId: string;
  currentScale: number;
  targetScale: number;
  swayPhase: number;
  swaySpeed: number;
}

export default React.forwardRef<VoxelTreeCanvasHandle, VoxelTreeCanvasProps>(function VoxelTreeCanvas(
  {
    selectedModules,
    reducedMotion = false,
    resetSignal
  },
  ref
) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // References across render loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const foliageInstancesRef = useRef<AnimatedVoxelInstance[]>([]);
  const foliageMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Camera orbit state (rotation-only: distance & pitch locked)
  const orbitStateRef = useRef({
    radius: 26.5,
    polarAngle: Math.PI / 2.75, // lowered camera perspective (~25 degrees elevation) matching reference
    azimuthAngle: Math.PI / 4.0, // 45 degrees exact isometric diamond angle
    target: new THREE.Vector3(0, 2.7, 0),
    isDragging: false,
    prevPointerX: 0
  });

  // Track latest reducedMotion and selectedModules in refs for animation loop
  const reducedMotionRef = useRef(reducedMotion);
  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  const updateCameraFnRef = useRef<(() => void) | null>(null);

  // Handle View Reset
  const handleResetCamera = useCallback(() => {
    orbitStateRef.current.azimuthAngle = Math.PI / 4.0;
    orbitStateRef.current.polarAngle = Math.PI / 2.75;
    if (updateCameraFnRef.current) {
      updateCameraFnRef.current();
    }
  }, []);

  // Expose resetCamera via ref
  useImperativeHandle(ref, () => ({
    resetCamera: handleResetCamera
  }), [handleResetCamera]);

  // Trigger camera reset whenever resetSignal changes
  useEffect(() => {
    if (resetSignal && resetSignal > 0) {
      handleResetCamera();
    }
  }, [resetSignal, handleResetCamera]);

  // Update target scales of foliage instances whenever selectedModules changes
  useEffect(() => {
    const instances = foliageInstancesRef.current;
    if (!instances || instances.length === 0) return;

    for (let i = 0; i < instances.length; i++) {
      const item = instances[i];
      const isEnabled = Boolean(selectedModules[item.moduleId]?.enabled);
      item.targetScale = isEnabled ? 1.0 : 0.0;

      // If reduced motion is active, jump directly to target scale
      if (reducedMotionRef.current) {
        item.currentScale = item.targetScale;
      }
    }
  }, [selectedModules]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. WebGL Support Detection
    let isWebGLAvailable = false;
    try {
      const canvas = document.createElement('canvas');
      isWebGLAvailable = Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      isWebGLAvailable = false;
    }

    if (!isWebGLAvailable) {
      setWebglSupported(false);
      return;
    }

    // 2. Initialize Three.js Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera with fixed field of view
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    cameraRef.current = camera;

    // Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = false; // clean, crisp game-art aesthetic without dark shadows
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch {
      setWebglSupported(false);
      return;
    }

    // 3. Lighting Setup: bright luminous ambient + soft warm sunlight from upper-left (no harsh shadows)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.90);
    scene.add(ambientLight);

    // Primary warm sunlight from upper-left (highlights top & upper-left exposed faces, matching reference)
    const keySunLight = new THREE.DirectionalLight(0xfffbeb, 0.75);
    keySunLight.position.set(-14, 22, 16);
    scene.add(keySunLight);

    // Secondary sky fill light (soft blue cool sky bounce from back-right)
    const skyFillLight = new THREE.DirectionalLight(0xdbeafe, 0.35);
    skyFillLight.position.set(14, 12, -14);
    scene.add(skyFillLight);

    // Soft under-bounce light (earth/turf reflection upward)
    const groundBounce = new THREE.DirectionalLight(0xdcfce7, 0.15);
    groundBounce.position.set(0, -6, 2);
    scene.add(groundBounce);

    // 4. Build Static Voxel Geometry (Pedestal, Trunk, and Category Branches)
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const staticVoxels = getStaticTreeVoxels();

    // Collect all static voxels
    const allStatic: VoxelCoord[] = [
      ...staticVoxels.plinth,
      ...staticVoxels.trunk,
      ...staticVoxels.branches.system,
      ...staticVoxels.branches.terminal,
      ...staticVoxels.branches.development,
      ...staticVoxels.branches.infrastructure,
      ...staticVoxels.branches.editors
    ];

    const staticMesh = new THREE.InstancedMesh(
      boxGeometry,
      new THREE.MeshLambertMaterial({
        reflectivity: 0.1
      }),
      allStatic.length
    );

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    for (let i = 0; i < allStatic.length; i++) {
      const v = allStatic[i];
      // Multiply by 1.002 to seal subpixel boundary rasterization seams between adjacent grid blocks
      const s = (v.size || 0.8) * 1.002;
      position.set(v.x, v.y, v.z);
      scale.set(s, s, s);
      matrix.compose(position, quaternion, scale);
      staticMesh.setMatrixAt(i, matrix);
      color.set(v.color || VOXEL_PALETTE.trunkMed);
      staticMesh.setColorAt(i, color);
    }
    staticMesh.instanceMatrix.needsUpdate = true;
    if (staticMesh.instanceColor) staticMesh.instanceColor.needsUpdate = true;
    scene.add(staticMesh);

    // 5. Build Dynamic Instanced Foliage Meshes
    const moduleClusters = getModuleFoliageClusters();
    const foliageList: AnimatedVoxelInstance[] = [];

    // Pre-calculate all candidate voxels across all 10 modules
    Object.values(moduleClusters).forEach((cluster) => {
      cluster.voxels.forEach((v, idx) => {
        const isCurrentlyEnabled = Boolean(selectedModules[cluster.moduleId]?.enabled);
        foliageList.push({
          baseCoord: v,
          moduleId: cluster.moduleId,
          categoryId: cluster.categoryId,
          currentScale: isCurrentlyEnabled ? 1.0 : 0.0,
          targetScale: isCurrentlyEnabled ? 1.0 : 0.0,
          swayPhase: idx * 0.45 + (v.x + v.z) * 0.8,
          swaySpeed: 1.2 + ((idx % 5) * 0.2)
        });
      });
    });

    foliageInstancesRef.current = foliageList;

    const foliageMesh = new THREE.InstancedMesh(
      boxGeometry,
      new THREE.MeshLambertMaterial({
        reflectivity: 0.1
      }),
      foliageList.length
    );

    for (let i = 0; i < foliageList.length; i++) {
      const item = foliageList[i];
      const v = item.baseCoord;
      const s = (v.size || 0.65) * item.currentScale * 1.002;
      position.set(v.x, v.y, v.z);
      scale.set(s, s, s);
      matrix.compose(position, quaternion, scale);
      color.set(v.color || VOXEL_PALETTE.leafPrimary);
      foliageMesh.setColorAt(i, color);
    }
    foliageMesh.instanceMatrix.needsUpdate = true;
    if (foliageMesh.instanceColor) foliageMesh.instanceColor.needsUpdate = true;
    scene.add(foliageMesh);
    foliageMeshRef.current = foliageMesh;

    // 6. Camera Position & Framing Update Function (Centers diorama in visible viewport)
    const updateCameraPosition = () => {
      const orbit = orbitStateRef.current;
      const x = orbit.target.x + orbit.radius * Math.sin(orbit.polarAngle) * Math.sin(orbit.azimuthAngle);
      const y = orbit.target.y + orbit.radius * Math.cos(orbit.polarAngle);
      const z = orbit.target.z + orbit.radius * Math.sin(orbit.polarAngle) * Math.cos(orbit.azimuthAngle);

      camera.position.set(x, y, z);
      camera.lookAt(orbit.target);

      // On desktop where the floating sidebar (width ~420px + margins) sits on the left,
      // offset camera framing so the tree island centers in the open stage area on the right.
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 500;
      if (w > 1024) {
        // Shift view center to clear the 420px floating sidebar
        const sidebarOffset = 210;
        camera.setViewOffset(w, h, -sidebarOffset, 0, w, h);
      } else {
        camera.clearViewOffset();
      }
      camera.updateProjectionMatrix();
    };
    updateCameraPosition();
    updateCameraFnRef.current = updateCameraPosition;

    // 7. Event Listeners for Rotation-Only Camera Control
    const canvasEl = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // Only primary mouse button or touch
      orbitStateRef.current.isDragging = true;
      orbitStateRef.current.prevPointerX = e.clientX;
      setIsRotating(true);
      canvasEl.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!orbitStateRef.current.isDragging) return;
      const deltaX = e.clientX - orbitStateRef.current.prevPointerX;
      orbitStateRef.current.prevPointerX = e.clientX;

      // Rotate azimuth (horizontal only)
      orbitStateRef.current.azimuthAngle -= deltaX * 0.009;
      updateCameraPosition();
    };

    const onPointerUp = (e: PointerEvent) => {
      orbitStateRef.current.isDragging = false;
      setIsRotating(false);
      try {
        if (canvasEl.hasPointerCapture(e.pointerId)) {
          canvasEl.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }
    };

    // STRICT CAMERA REQUIREMENTS: Disable zoom and pan
    // Mouse wheel must NOT zoom the camera
    const onWheel = (e: WheelEvent) => {
      // Do nothing to camera: allow natural browser scroll if needed
      // Never change camera distance or zoom
    };

    // Touch gesture handling: single touch rotates, multi-touch pinch is ignored
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        orbitStateRef.current.isDragging = true;
        orbitStateRef.current.prevPointerX = e.touches[0].clientX;
        setIsRotating(true);
      } else {
        // Prevent pinch zoom
        orbitStateRef.current.isDragging = false;
        setIsRotating(false);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!orbitStateRef.current.isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - orbitStateRef.current.prevPointerX;
      orbitStateRef.current.prevPointerX = touch.clientX;

      orbitStateRef.current.azimuthAngle -= deltaX * 0.009;
      updateCameraPosition();
    };

    const onTouchEnd = () => {
      orbitStateRef.current.isDragging = false;
      setIsRotating(false);
    };

    canvasEl.addEventListener('pointerdown', onPointerDown);
    canvasEl.addEventListener('pointermove', onPointerMove);
    canvasEl.addEventListener('pointerup', onPointerUp);
    canvasEl.addEventListener('pointercancel', onPointerUp);
    canvasEl.addEventListener('wheel', onWheel, { passive: true });
    canvasEl.addEventListener('touchstart', onTouchStart, { passive: true });
    canvasEl.addEventListener('touchmove', onTouchMove, { passive: true });
    canvasEl.addEventListener('touchend', onTouchEnd, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      updateCameraPosition();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation & Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const instances = foliageInstancesRef.current;
      const mesh = foliageMeshRef.current;

      if (instances && mesh) {
        let needsUpdate = false;
        const speed = reducedMotionRef.current ? 1.0 : 0.18; // smooth spring lerp

        for (let i = 0; i < instances.length; i++) {
          const item = instances[i];
          const diff = item.targetScale - item.currentScale;

          if (Math.abs(diff) > 0.001) {
            item.currentScale += diff * speed;
            needsUpdate = true;
          } else if (item.currentScale !== item.targetScale) {
            item.currentScale = item.targetScale;
            needsUpdate = true;
          }

          // Subtle idle sway when visible
          const v = item.baseCoord;
          let swayY = 0;
          if (item.currentScale > 0.05 && !reducedMotionRef.current) {
            swayY = Math.sin(elapsedTime * item.swaySpeed + item.swayPhase) * 0.03 * item.currentScale;
            needsUpdate = true;
          }

          const s = (v.size || 0.65) * item.currentScale * 1.002;
          position.set(v.x, v.y + swayY, v.z);
          scale.set(s, s, s);
          matrix.compose(position, quaternion, scale);
          mesh.setMatrixAt(i, matrix);
        }

        if (needsUpdate) {
          mesh.instanceMatrix.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      canvasEl.removeEventListener('pointermove', onPointerMove);
      canvasEl.removeEventListener('pointerup', onPointerUp);
      canvasEl.removeEventListener('pointercancel', onPointerUp);
      canvasEl.removeEventListener('wheel', onWheel);
      canvasEl.removeEventListener('touchstart', onTouchStart);
      canvasEl.removeEventListener('touchmove', onTouchMove);
      canvasEl.removeEventListener('touchend', onTouchEnd);

      if (container.contains(canvasEl)) {
        container.removeChild(canvasEl);
      }
      renderer.dispose();
      boxGeometry.dispose();
    };
  }, []); // Run once on mount

  // Render Fallback if WebGL unavailable
  if (!webglSupported) {
    return (
      <div className="voxel-tree-fallback" role="img" aria-label="Isometric voxel tree preview">
        <div className="fallback-card">
          <div className="fallback-badge">WebGL Fallback Mode</div>
          <div className="fallback-icon">🌲</div>
          <h3 className="fallback-title">Deterministic Voxel Environment</h3>
          <p className="fallback-desc">
            3D WebGL acceleration is currently unavailable on this device. Your configuration
            state remains 100% active and synchronized with live YAML and command generation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="voxel-tree-viewport-container">
      <div
        ref={mountRef}
        className={`voxel-tree-canvas-mount ${isRotating ? 'is-interacting' : ''}`}
        aria-label="3D Voxel Tree: Drag horizontally to inspect environment"
        role="region"
      />

      {/* Viewport UI Controls & Legend */}
      <div className="voxel-tree-overlay">
        <div className="voxel-tree-hint-badge">
          <span className="hint-drag-icon">↔</span>
          <span>Drag horizontally to rotate</span>
        </div>

        <button
          type="button"
          onClick={handleResetCamera}
          className="btn-tree-reset"
          title="Reset 3D camera angle"
          aria-label="Reset camera orientation"
        >
          Reset View
        </button>
      </div>
    </div>
  );
});
