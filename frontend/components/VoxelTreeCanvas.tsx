'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface VoxelTreeCanvasHandle {
  resetCamera: () => void;
}

export interface TreeModuleItem {
  id: string;
  name: string;
  category: 'system' | 'terminal' | 'development' | 'infrastructure' | 'editors' | string;
  color: string;
  anchor: [number, number, number];
  foliageCenter: [number, number, number];
  foliageRadius: number;
}

export const SANCTUARY_MODULES: TreeModuleItem[] = [
  // Left Column (Canopy & Trunk: system, terminal, editors, development)
  {
    id: 'system',
    name: 'System Base',
    category: 'system',
    anchor: [-0.9, 2.5, 0.7],
    foliageCenter: [-2.0, 5.6, 1.3],
    foliageRadius: 1.65,
    color: '#059669'
  },
  {
    id: 'zsh',
    name: 'Zsh & Oh My Zsh',
    category: 'terminal',
    anchor: [-2.4, 6.5, 1.1],
    foliageCenter: [-2.9, 7.0, 1.2],
    foliageRadius: 1.8,
    color: '#10b981'
  },
  {
    id: 'git',
    name: 'Git',
    category: 'development',
    anchor: [-1.5, 8.1, -0.6],
    foliageCenter: [-1.8, 8.5, -0.8],
    foliageRadius: 1.75,
    color: '#34d399'
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'editors',
    anchor: [0.1, 9.1, 0.8],
    foliageCenter: [0.2, 9.5, 0.9],
    foliageRadius: 2.0,
    color: '#22c55e'
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    category: 'editors',
    anchor: [-0.6, 7.2, 2.3],
    foliageCenter: [-0.7, 7.5, 2.6],
    foliageRadius: 1.65,
    color: '#4ade80'
  },

  // Right Column (Land & Roots: runtimes, cloud, containers)
  {
    id: 'node',
    name: 'Node.js',
    category: 'development',
    anchor: [2.2, 0.45, 1.8],
    foliageCenter: [2.7, 7.6, 1.3],
    foliageRadius: 1.85,
    color: '#eab308'
  },
  {
    id: 'python',
    name: 'Python',
    category: 'development',
    anchor: [2.9, 0.4, -0.6],
    foliageCenter: [3.1, 6.2, -1.0],
    foliageRadius: 1.75,
    color: '#84cc16'
  },
  {
    id: 'java',
    name: 'Java JDK',
    category: 'development',
    anchor: [1.4, 0.45, 3.0],
    foliageCenter: [1.8, 8.6, -1.4],
    foliageRadius: 1.65,
    color: '#f59e0b'
  },
  {
    id: 'docker',
    name: 'Docker Engine',
    category: 'infrastructure',
    anchor: [3.3, 0.4, 2.1],
    foliageCenter: [2.1, 5.2, 2.3],
    foliageRadius: 1.65,
    color: '#14b8a6'
  },
  {
    id: 'gcloud',
    name: 'Google Cloud SDK',
    category: 'infrastructure',
    anchor: [0.9, 0.4, -2.8],
    foliageCenter: [0.9, 6.6, -2.5],
    foliageRadius: 1.6,
    color: '#0d9488'
  }
];

interface VoxelTreeCanvasProps {
  selectedModules: Record<string, { enabled: boolean; version?: string }>;
  hoveredModuleId?: string | null;
  onHoverModule?: (id: string | null) => void;
  onToggleModule?: (id: string) => void;
  reducedMotion?: boolean;
  resetSignal?: number;
  cameraRefOut?: (cam: THREE.PerspectiveCamera, group: THREE.Group) => void;
}

interface FoliageVoxelData {
  moduleId: string;
  basePos: THREE.Vector3;
  color: THREE.Color;
  hoverColor: THREE.Color;
  scale: number;
  velocity: number;
  phase: number;
}

export default forwardRef<VoxelTreeCanvasHandle, VoxelTreeCanvasProps>(function VoxelTreeCanvas(
  {
    selectedModules,
    hoveredModuleId = null,
    onHoverModule,
    onToggleModule,
    reducedMotion = false,
    resetSignal,
    cameraRefOut
  },
  ref
) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const hoverPillRef = useRef<HTMLDivElement | null>(null);
  const hoverTextRef = useRef<HTMLSpanElement | null>(null);
  const hoverPipRef = useRef<HTMLSpanElement | null>(null);

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const treeGroupRef = useRef<THREE.Group | null>(null);
  const foliageVoxelsRef = useRef<FoliageVoxelData[]>([]);
  const foliageMeshRef = useRef<THREE.InstancedMesh | null>(null);

  const DEFAULT_CAM_POS = new THREE.Vector3(14.5, 9.2, 18.0);
  const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 4.9, 0);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.copy(DEFAULT_CAM_POS);
      controlsRef.current.target.copy(DEFAULT_CAM_TARGET);
      controlsRef.current.update();
    }
  };

  useImperativeHandle(ref, () => ({
    resetCamera: handleResetCamera
  }));

  useEffect(() => {
    if (resetSignal && resetSignal > 0) {
      handleResetCamera();
    }
  }, [resetSignal]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Deterministic pseudo-random
    let seed = 108;
    function rand() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xe2f1ea, 0.02);

    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 140);
    camera.position.copy(DEFAULT_CAM_POS);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(DEFAULT_CAM_TARGET);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 10;
    controls.maxDistance = 30;
    controlsRef.current = controls;

    // Atrium Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbe5ce, 1.15);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffdf5, 1.65);
    sunLight.position.set(16, 28, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 65;
    const shadowBound = 18;
    sunLight.shadow.camera.left = -shadowBound;
    sunLight.shadow.camera.right = shadowBound;
    sunLight.shadow.camera.top = shadowBound;
    sunLight.shadow.camera.bottom = -shadowBound;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    const bounceLight = new THREE.DirectionalLight(0x6ee7b7, 0.55);
    bounceLight.position.set(-16, 10, -14);
    scene.add(bounceLight);

    // Subtle Horizon Ground Plane
    const horizonPlaneGeo = new THREE.CircleGeometry(75, 64);
    const horizonPlaneMat = new THREE.MeshStandardMaterial({
      color: 0xd8ede2,
      roughness: 0.95,
      metalness: 0.0
    });
    const horizonPlane = new THREE.Mesh(horizonPlaneGeo, horizonPlaneMat);
    horizonPlane.rotation.x = -Math.PI / 2;
    horizonPlane.position.y = -0.48;
    horizonPlane.receiveShadow = true;
    scene.add(horizonPlane);

    const treeGroup = new THREE.Group();
    scene.add(treeGroup);
    treeGroupRef.current = treeGroup;

    if (cameraRefOut) {
      cameraRefOut(camera, treeGroup);
    }

    const voxelGeo = new THREE.BoxGeometry(0.46, 0.46, 0.46);
    const dummy = new THREE.Object3D();

    // 1. Expansive Lush Meadow with Crystal Stream and Wildflowers
    const staticVoxels: Array<{ pos: [number, number, number]; color: string }> = [];
    const meadowRadius = 26;

    for (let x = -meadowRadius; x <= meadowRadius; x++) {
      for (let z = -meadowRadius; z <= meadowRadius; z++) {
        const dist = Math.sqrt(x * x + z * z);
        if (dist > meadowRadius) continue;

        const wave = Math.sin(x * 0.22) * Math.cos(z * 0.22);
        const centerMound = dist < 5.5 ? 1 : 0;
        const hillHeight = (wave > 0.32 && dist > 6 && dist < 22) ? 1 : 0;
        const isStream = Math.abs(x - z * 0.65 - 5.5) < 1.35 && dist > 3.5 && dist < 23;

        if (isStream) {
          staticVoxels.push({
            pos: [x * 0.46, -0.18, z * 0.46],
            color: (x + z) % 2 === 0 ? '#7dd3fc' : '#38bdf8'
          });
          continue;
        }

        const grassPalette = ['#16a34a', '#15803d', '#22c55e', '#4ade80', '#10b981'];
        const colorIdx = Math.abs(x * 3 + z * 5) % grassPalette.length;
        const baseColor = grassPalette[colorIdx];

        const yLevel = (centerMound + hillHeight) * 0.34;
        staticVoxels.push({
          pos: [x * 0.46, yLevel, z * 0.46],
          color: baseColor
        });

        if (yLevel > 0) {
          staticVoxels.push({
            pos: [x * 0.46, 0, z * 0.46],
            color: '#15803d'
          });
        }

        const rVal = rand();
        if (dist > 3.2 && dist < 16) {
          if (rVal < 0.024) {
            staticVoxels.push({
              pos: [x * 0.46, yLevel + 0.38, z * 0.46],
              color: rVal < 0.012 ? '#fef08a' : '#ffffff'
            });
          } else if (rVal > 0.982) {
            staticVoxels.push({
              pos: [x * 0.46, yLevel + 0.25, z * 0.46],
              color: '#e2e8f0'
            });
          }
        }
      }
    }

    // 2. Bonsai Trunk & Buttressed Roots
    const rootAngles = [0, 1.1, 2.3, 3.5, 4.7, 5.5];
    rootAngles.forEach(ang => {
      for (let r = 1; r <= 4; r++) {
        const rx = Math.cos(ang) * r * 0.65;
        const rz = Math.sin(ang) * r * 0.65;
        staticVoxels.push({
          pos: [rx * 0.46, (5 - r) * 0.16, rz * 0.46],
          color: '#78350f'
        });
      }
    });

    for (let y = 1; y <= 14; y++) {
      const curveX = Math.sin(y * 0.22) * 0.6;
      const curveZ = Math.cos(y * 0.18) * 0.4;
      const radius = y < 4 ? 2.2 : y < 9 ? 1.55 : 1.0;

      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          if (dx * dx + dz * dz <= radius) {
            staticVoxels.push({
              pos: [(dx + curveX) * 0.46, y * 0.44, (dz + curveZ) * 0.46],
              color: (y + dx) % 2 === 0 ? '#78350f' : '#92400e'
            });
          }
        }
      }
    }

    const staticMat = new THREE.MeshStandardMaterial({ roughness: 0.76, metalness: 0.04 });
    const staticMesh = new THREE.InstancedMesh(voxelGeo, staticMat, staticVoxels.length);
    staticMesh.castShadow = true;
    staticMesh.receiveShadow = true;

    const tempColor = new THREE.Color();
    staticVoxels.forEach((v, i) => {
      dummy.position.set(v.pos[0], v.pos[1], v.pos[2]);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      staticMesh.setMatrixAt(i, dummy.matrix);
      staticMesh.setColorAt(i, tempColor.set(v.color));
    });
    staticMesh.instanceMatrix.needsUpdate = true;
    if (staticMesh.instanceColor) {
      staticMesh.instanceColor.needsUpdate = true;
    }
    treeGroup.add(staticMesh);

    // 3. Foliage Clusters
    const foliageList: FoliageVoxelData[] = [];
    SANCTUARY_MODULES.forEach((mod) => {
      const [cx, cy, cz] = mod.foliageCenter;
      const r = mod.foliageRadius;
      const baseColor = new THREE.Color(mod.color);

      for (let x = -3; x <= 3; x++) {
        for (let y = -2; y <= 2; y++) {
          for (let z = -3; z <= 3; z++) {
            const dist = Math.sqrt((x * 0.52) ** 2 + (y * 0.7) ** 2 + (z * 0.52) ** 2);
            if (dist <= r && rand() > 0.2) {
              const shadeShift = (rand() - 0.45) * 0.14;
              const col = baseColor.clone().offsetHSL(0, 0.05, shadeShift);
              foliageList.push({
                moduleId: mod.id,
                basePos: new THREE.Vector3(cx + x * 0.46, cy + y * 0.46, cz + z * 0.46),
                color: col,
                hoverColor: col.clone().lerp(new THREE.Color('#fef08a'), 0.6),
                scale: selectedModules[mod.id]?.enabled ? 1 : 0,
                velocity: 0,
                phase: rand() * Math.PI * 2
              });
            }
          }
        }
      }
    });
    foliageVoxelsRef.current = foliageList;

    const foliageMat = new THREE.MeshStandardMaterial({ roughness: 0.58, metalness: 0.04 });
    const foliageMesh = new THREE.InstancedMesh(voxelGeo, foliageMat, foliageList.length);
    foliageMesh.castShadow = true;
    foliageMesh.receiveShadow = true;
    treeGroup.add(foliageMesh);
    foliageMeshRef.current = foliageMesh;

    // 4. Pollen Particles
    const particleCount = 65;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 20;
      particlePositions[i * 3 + 1] = Math.random() * 11 + 0.6;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.15,
      transparent: true,
      opacity: 0.55
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Raycasting
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-99, -99);
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(foliageMesh);

      const pill = hoverPillRef.current;
      const textEl = hoverTextRef.current;
      const pipEl = hoverPipRef.current;

      if (hits.length > 0) {
        const instanceId = hits[0].instanceId;
        if (instanceId !== undefined) {
          const voxel = foliageList[instanceId];
          if (voxel && selectedModules[voxel.moduleId]?.enabled) {
            const mod = SANCTUARY_MODULES.find(m => m.id === voxel.moduleId);
            if (mod) {
              if (onHoverModule) onHoverModule(mod.id);
              if (pill && textEl && pipEl) {
                pill.classList.add('visible');
                pill.style.left = `${e.clientX}px`;
                pill.style.top = `${e.clientY}px`;
                textEl.textContent = `${mod.name} · ${selectedModules[mod.id]?.version || 'Active'}`;
                pipEl.style.background = mod.color;
              }
              return;
            }
          }
        }
      }

      if (pill && pill.classList.contains('visible')) {
        pill.classList.remove('visible');
        if (onHoverModule) onHoverModule(null);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist < 5 && hoveredModuleId && onToggleModule) {
        onToggleModule(hoveredModuleId);
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!reducedMotion) {
        treeGroup.rotation.y = Math.sin(elapsed * 0.22) * 0.07;
        particles.rotation.y = elapsed * 0.03;
      }

      for (let i = 0; i < foliageList.length; i++) {
        const v = foliageList[i];
        const isEnabled = Boolean(selectedModules[v.moduleId]?.enabled);
        const isHovered = hoveredModuleId === v.moduleId;

        const targetScale = isEnabled ? (isHovered ? 1.15 : 1.0) : (isHovered ? 0.38 : 0.0);

        if (reducedMotion) {
          v.scale = targetScale;
        } else {
          const force = (targetScale - v.scale) * 0.18;
          v.velocity = (v.velocity + force) * 0.76;
          v.scale += v.velocity;
        }

        const swayY = (!reducedMotion && v.scale > 0.05)
          ? Math.sin(elapsed * 1.8 + v.phase) * 0.045
          : 0;

        dummy.position.set(v.basePos.x, v.basePos.y + swayY, v.basePos.z);
        const s = Math.max(0.0001, v.scale);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        foliageMesh.setMatrixAt(i, dummy.matrix);
        foliageMesh.setColorAt(i, isHovered ? v.hoverColor : v.color);
      }
      foliageMesh.instanceMatrix.needsUpdate = true;
      if (foliageMesh.instanceColor) foliageMesh.instanceColor.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // Run once on mount

  return (
    <>
      <div id="canvas-container" ref={mountRef} aria-label="Interactive 3D Voxel Sanctuary Tree" />
      <div id="tree-hover-pill" ref={hoverPillRef} className="lush-glass">
        <span className="cat-pip" ref={hoverPipRef} />
        <span id="hover-pill-text" ref={hoverTextRef}>Module</span>
      </div>
    </>
  );
});
