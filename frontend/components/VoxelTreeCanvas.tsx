'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
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
  const dynamicBloomRef = useRef<HTMLDivElement | null>(null);

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const treeGroupRef = useRef<THREE.Group | null>(null);
  const foliageVoxelsRef = useRef<FoliageVoxelData[]>([]);
  const foliageMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const resetAnimRef = useRef<{
    active: boolean;
    startTime: number;
    startCamPos: THREE.Vector3;
    startTarget: THREE.Vector3;
  }>({
    active: false,
    startTime: 0,
    startCamPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3()
  });

  const DEFAULT_CAM_POS = new THREE.Vector3(14.5, 9.2, 18.0);
  const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 4.9, 0);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      resetAnimRef.current = {
        active: true,
        startTime: performance.now(),
        startCamPos: cameraRef.current.position.clone(),
        startTarget: controlsRef.current.target.clone()
      };
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
    scene.fog = new THREE.FogExp2(0xe2f1ea, 0.016);

    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 160);
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
    controls.minDistance = 9;
    controls.maxDistance = 34;
    controlsRef.current = controls;

    // Atrium Lighting & Dynamic Sunlight
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbe5ce, 1.15);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    // Dynamic solar Directional Light
    const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.85);
    sunLight.position.set(16, 26, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 4;
    sunLight.shadow.camera.far = 70;
    const shadowBound = 19;
    sunLight.shadow.camera.left = -shadowBound;
    sunLight.shadow.camera.right = shadowBound;
    sunLight.shadow.camera.top = shadowBound;
    sunLight.shadow.camera.bottom = -shadowBound;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.normalBias = 0.035; // Eliminates voxel shadow acne
    scene.add(sunLight);

    // Directional light target explicitly added and positioned at tree canopy
    const sunTarget = new THREE.Object3D();
    sunTarget.position.set(0, 4.8, 0);
    scene.add(sunTarget);
    sunLight.target = sunTarget;

    // Soft botanical bounce light
    const bounceLight = new THREE.DirectionalLight(0x6ee7b7, 0.45);
    bounceLight.position.set(-16, 10, -14);
    scene.add(bounceLight);

    // Warm Sun Corona Sprite in 3D Sky
    const sunCanvas = document.createElement('canvas');
    sunCanvas.width = 256;
    sunCanvas.height = 256;
    const sunCtx = sunCanvas.getContext('2d');
    if (sunCtx) {
      const grad = sunCtx.createRadialGradient(128, 128, 12, 128, 128, 128);
      grad.addColorStop(0, 'rgba(255, 255, 240, 1.0)');
      grad.addColorStop(0.2, 'rgba(254, 240, 138, 0.85)');
      grad.addColorStop(0.5, 'rgba(251, 191, 36, 0.35)');
      grad.addColorStop(0.8, 'rgba(245, 158, 11, 0.12)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
      sunCtx.fillStyle = grad;
      sunCtx.fillRect(0, 0, 256, 256);
    }
    const sunTexture = new THREE.CanvasTexture(sunCanvas);
    const sunSpriteMat = new THREE.SpriteMaterial({
      map: sunTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sunSprite = new THREE.Sprite(sunSpriteMat);
    sunSprite.scale.set(16, 16, 1);
    scene.add(sunSprite);

    // Soft Horizon Ground Plane
    const horizonPlaneGeo = new THREE.CircleGeometry(85, 64);
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

    // Root Contact Shadow Disc (grounds tree and moves with tree breathing)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const sGrad = sCtx.createRadialGradient(64, 64, 4, 64, 64, 64);
      sGrad.addColorStop(0, 'rgba(15, 41, 30, 0.42)');
      sGrad.addColorStop(0.45, 'rgba(15, 41, 30, 0.22)');
      sGrad.addColorStop(0.8, 'rgba(15, 41, 30, 0.06)');
      sGrad.addColorStop(1, 'rgba(15, 41, 30, 0)');
      sCtx.fillStyle = sGrad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const contactShadowTex = new THREE.CanvasTexture(shadowCanvas);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false
    });
    const contactShadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), contactShadowMat);
    contactShadowMesh.rotation.x = -Math.PI / 2;
    contactShadowMesh.position.y = -0.15;
    scene.add(contactShadowMesh);

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
    const voxelCoordSet = new Set<string>();
    const meadowRadius = 26;

    for (let x = -meadowRadius; x <= meadowRadius; x++) {
      for (let z = -meadowRadius; z <= meadowRadius; z++) {
        const dist = Math.sqrt(x * x + z * z);
        if (dist > meadowRadius) continue;

        const wave = Math.sin(x * 0.22) * Math.cos(z * 0.22);
        const centerMound = dist < 5.5 ? 1 : 0;
        const hillHeight = wave > 0.32 && dist > 6 && dist < 22 ? 1 : 0;
        const isStream = Math.abs(x - z * 0.65 - 5.5) < 1.35 && dist > 3.5 && dist < 23;

        const vx = x * 0.46;
        const vz = z * 0.46;

        if (isStream) {
          const col = (x + z) % 2 === 0 ? '#7dd3fc' : '#38bdf8';
          staticVoxels.push({ pos: [vx, -0.18, vz], color: col });
          voxelCoordSet.add(`${vx.toFixed(2)},-0.18,${vz.toFixed(2)}`);
          continue;
        }

        const grassPalette = ['#16a34a', '#15803d', '#22c55e', '#4ade80', '#10b981'];
        const colorIdx = Math.abs(x * 3 + z * 5) % grassPalette.length;
        const baseColor = grassPalette[colorIdx];

        const yLevel = (centerMound + hillHeight) * 0.34;
        staticVoxels.push({ pos: [vx, yLevel, vz], color: baseColor });
        voxelCoordSet.add(`${vx.toFixed(2)},${yLevel.toFixed(2)},${vz.toFixed(2)}`);

        if (yLevel > 0) {
          staticVoxels.push({ pos: [vx, 0, vz], color: '#15803d' });
          voxelCoordSet.add(`${vx.toFixed(2)},0.00,${vz.toFixed(2)}`);
        }

        const rVal = rand();
        if (dist > 3.2 && dist < 16) {
          if (rVal < 0.024) {
            const flowerCol = rVal < 0.012 ? '#fef08a' : '#ffffff';
            staticVoxels.push({ pos: [vx, yLevel + 0.38, vz], color: flowerCol });
          } else if (rVal > 0.982) {
            staticVoxels.push({ pos: [vx, yLevel + 0.25, vz], color: '#e2e8f0' });
          }
        }
      }
    }

    // 2. Bonsai Trunk & Buttressed Roots
    const rootAngles = [0, 1.1, 2.3, 3.5, 4.7, 5.5];
    rootAngles.forEach((ang) => {
      for (let r = 1; r <= 4; r++) {
        const rx = Math.cos(ang) * r * 0.65;
        const rz = Math.sin(ang) * r * 0.65;
        const ry = (5 - r) * 0.16;
        staticVoxels.push({
          pos: [rx * 0.46, ry, rz * 0.46],
          color: '#78350f'
        });
      }
    });

    // Main Central Trunk Column
    for (let y = 1; y <= 15; y++) {
      const curveX = Math.sin(y * 0.22) * 0.6;
      const curveZ = Math.cos(y * 0.18) * 0.4;
      const radius = y < 4 ? 2.2 : y < 9 ? 1.55 : 1.0;

      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          if (dx * dx + dz * dz <= radius) {
            const px = (dx + curveX) * 0.46;
            const py = y * 0.44;
            const pz = (dz + curveZ) * 0.46;
            const key = `${px.toFixed(2)},${py.toFixed(2)},${pz.toFixed(2)}`;
            if (!voxelCoordSet.has(key)) {
              voxelCoordSet.add(key);
              staticVoxels.push({
                pos: [px, py, pz],
                color: (y + dx) % 2 === 0 ? '#78350f' : '#92400e'
              });
            }
          }
        }
      }
    }

    // 3. ORGANIC VOXEL BRANCHES CONNECTING TRUNK TO ALL FOLIAGE CANOPY CLUSTERS
    const woodColors = ['#78350f', '#92400e', '#5c2b09', '#a27b68', '#6b300c'];

    function buildBranch(
      start: [number, number, number],
      ctrl: [number, number, number],
      end: [number, number, number],
      radiusStart: number,
      radiusEnd: number
    ) {
      const dist = Math.hypot(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
      const steps = Math.max(7, Math.ceil(dist / 0.28));

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const inv = 1 - t;
        // Quadratic Bezier interpolation
        const bx = inv * inv * start[0] + 2 * inv * t * ctrl[0] + t * t * end[0];
        const by = inv * inv * start[1] + 2 * inv * t * ctrl[1] + t * t * end[1];
        const bz = inv * inv * start[2] + 2 * inv * t * ctrl[2] + t * t * end[2];
        const r = radiusStart * (1 - t) + radiusEnd * t;

        for (let ox = -r; ox <= r; ox += 0.42) {
          for (let oy = -r; oy <= r; oy += 0.42) {
            for (let oz = -r; oz <= r; oz += 0.42) {
              if (ox * ox + oy * oy + oz * oz <= r * r) {
                const gx = Math.round((bx + ox) / 0.46) * 0.46;
                const gy = Math.round((by + oy) / 0.46) * 0.46;
                const gz = Math.round((bz + oz) / 0.46) * 0.46;
                const key = `${gx.toFixed(2)},${gy.toFixed(2)},${gz.toFixed(2)}`;
                if (!voxelCoordSet.has(key)) {
                  voxelCoordSet.add(key);
                  const cIdx = Math.abs(Math.round(gx * 5 + gy * 7 + gz * 3)) % woodColors.length;
                  staticVoxels.push({ pos: [gx, gy, gz], color: woodColors[cIdx] });
                }
              }
            }
          }
        }
      }
    }

    // Branch 1: West-Lower to System Base [-2.0, 5.6, 1.3]
    buildBranch([-0.3, 3.8, 0.3], [-1.1, 4.6, 0.8], [-1.9, 5.4, 1.2], 0.75, 0.35);

    // Branch 2: West-Upper to Zsh & Oh My Zsh [-2.9, 7.0, 1.2]
    buildBranch([-1.0, 4.9, 0.7], [-1.9, 5.9, 1.0], [-2.7, 6.8, 1.15], 0.65, 0.32);

    // Branch 3: North-West to Git [-1.8, 8.5, -0.8]
    buildBranch([-0.4, 6.0, -0.2], [-1.1, 7.2, -0.5], [-1.7, 8.2, -0.75], 0.62, 0.3);

    // Branch 4: Central High Bough to VS Code [0.2, 9.5, 0.9]
    buildBranch([0.0, 6.4, 0.1], [0.1, 7.9, 0.5], [0.18, 9.2, 0.85], 0.7, 0.32);

    // Branch 5: South-West to Google Chrome [-0.7, 7.5, 2.6]
    buildBranch([-0.5, 5.0, 0.9], [-0.6, 6.2, 1.8], [-0.68, 7.2, 2.45], 0.6, 0.32);

    // Branch 6: East-Upper to Node.js [2.7, 7.6, 1.3]
    buildBranch([0.4, 5.1, 0.4], [1.5, 6.3, 0.9], [2.5, 7.3, 1.25], 0.68, 0.32);

    // Branch 7: East-Mid to Python [3.1, 6.2, -1.0]
    buildBranch([0.5, 4.4, -0.2], [1.8, 5.2, -0.6], [2.9, 6.0, -0.95], 0.65, 0.32);

    // Branch 8: North-East to Java JDK [1.8, 8.6, -1.4]
    buildBranch([0.3, 5.8, -0.4], [1.0, 7.2, -0.9], [1.7, 8.3, -1.35], 0.6, 0.3);

    // Branch 9: South-East to Docker Engine [2.1, 5.2, 2.3]
    buildBranch([0.4, 3.8, 0.6], [1.2, 4.5, 1.5], [2.0, 5.0, 2.15], 0.68, 0.35);

    // Branch 10: North to Google Cloud SDK [0.9, 6.6, -2.5]
    buildBranch([0.1, 4.6, -0.5], [0.5, 5.6, -1.5], [0.85, 6.3, -2.35], 0.62, 0.32);

    // Render Static Tree Structure (Meadow, Trunk & Branches)
    const staticMat = new THREE.MeshStandardMaterial({ roughness: 0.74, metalness: 0.04 });
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

    // 4. Foliage Clusters
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

    const foliageMat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.04 });
    const foliageMesh = new THREE.InstancedMesh(voxelGeo, foliageMat, foliageList.length);
    foliageMesh.castShadow = true;
    foliageMesh.receiveShadow = true;
    treeGroup.add(foliageMesh);
    foliageMeshRef.current = foliageMesh;

    // 5. Pollen Particles
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

    // 6. Raycasting for Module Selection & Hover
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
            const mod = SANCTUARY_MODULES.find((m) => m.id === voxel.moduleId);
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
    const sunScreenProjected = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // DYNAMIC SOLAR CELESTIAL MOTION (Natural, soft moving sunlight and living shadow)
      const sunAngle = 0.85 + (reducedMotion ? 0 : Math.sin(elapsed * 0.04) * 0.22);
      const sunDist = 34;
      const sunX = Math.cos(sunAngle) * sunDist;
      const sunZ = Math.sin(sunAngle) * sunDist;
      const sunY = 27 + (reducedMotion ? 0 : Math.sin(elapsed * 0.03) * 1.8);
      sunLight.position.set(sunX, sunY, sunZ);
      sunSprite.position.set(sunX * 1.15, sunY * 1.15, sunZ * 1.15);

      // Camera Reset Animation (Angle interpolation, rotation sweep, and tree shrink)
      if (resetAnimRef.current.active) {
        const now = performance.now();
        const duration = 1000;
        const progress = Math.min(1, (now - resetAnimRef.current.startTime) / duration);
        // Cubic ease-out
        const ease = 1 - Math.pow(1 - progress, 3);

        camera.position.lerpVectors(resetAnimRef.current.startCamPos, DEFAULT_CAM_POS, ease);
        controls.target.lerpVectors(resetAnimRef.current.startTarget, DEFAULT_CAM_TARGET, ease);

        // Tactile Tree Shrink Pulse & Re-bounce
        const pulse = Math.sin(progress * Math.PI);
        const shrinkScale = 1.0 - pulse * 0.12;
        treeGroup.scale.set(shrinkScale, shrinkScale, shrinkScale);

        if (progress >= 1) {
          resetAnimRef.current.active = false;
          treeGroup.scale.set(1, 1, 1);
        }
      }

      // Gentle Tree Breathing & Sway
      if (!reducedMotion && !resetAnimRef.current.active) {
        treeGroup.rotation.y = Math.sin(elapsed * 0.22) * 0.055;
        particles.rotation.y = elapsed * 0.03;
        contactShadowMesh.rotation.z = Math.sin(elapsed * 0.22) * 0.05;
      }

      // Foliage Voxels Scale & Color
      for (let i = 0; i < foliageList.length; i++) {
        const v = foliageList[i];
        const isEnabled = Boolean(selectedModules[v.moduleId]?.enabled);
        const isHovered = hoveredModuleId === v.moduleId;

        const targetScale = isEnabled ? (isHovered ? 1.15 : 1.0) : isHovered ? 0.38 : 0.0;

        if (reducedMotion) {
          v.scale = targetScale;
        } else {
          const force = (targetScale - v.scale) * 0.18;
          v.velocity = (v.velocity + force) * 0.76;
          v.scale += v.velocity;
        }

        const swayY =
          !reducedMotion && v.scale > 0.05 ? Math.sin(elapsed * 1.8 + v.phase) * 0.045 : 0;

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

      // REALISTIC 3D SUNLIGHT BLOOM & LENS FLARE (Tied to real 3D sun position)
      if (dynamicBloomRef.current) {
        sunScreenProjected.copy(sunSprite.position).project(camera);
        const isFacingSun = sunScreenProjected.z < 1;
        const screenX = (sunScreenProjected.x * 0.5 + 0.5) * window.innerWidth;
        const screenY = (-sunScreenProjected.y * 0.5 + 0.5) * window.innerHeight;

        const isVisibleOnScreen =
          isFacingSun &&
          screenX >= -window.innerWidth * 0.2 &&
          screenX <= window.innerWidth * 1.2 &&
          screenY >= -window.innerHeight * 0.2 &&
          screenY <= window.innerHeight * 1.2;

        if (isVisibleOnScreen) {
          // Proximity to screen center
          const dx = (screenX - window.innerWidth / 2) / (window.innerWidth / 2);
          const dy = (screenY - window.innerHeight / 2) / (window.innerHeight / 2);
          const distFromCenter = Math.min(1.4, Math.hypot(dx, dy));
          const bloomIntensity = Math.max(0, 1 - distFromCenter * 0.45);

          dynamicBloomRef.current.style.opacity = bloomIntensity.toFixed(3);
          dynamicBloomRef.current.style.transform = `translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0) translate(-50%, -50%)`;
        } else {
          dynamicBloomRef.current.style.opacity = '0';
        }
      }
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
      {/* Real 3D-Projected Sunlight Dynamic Bloom */}
      <div id="dynamic-sunlight-bloom" ref={dynamicBloomRef} className="dynamic-sunlight-bloom" />
      <div id="tree-hover-pill" ref={hoverPillRef} className="lush-glass">
        <span className="cat-pip" ref={hoverPipRef} />
        <span id="hover-pill-text" ref={hoverTextRef}>
          Module
        </span>
      </div>
    </>
  );
});
