import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Entrance } from './Entrance';
import { Suspense } from 'react';

export function Scene() {
  console.log('Rendering Scene component');
  
  return (
    <Canvas shadows className="h-full w-full">
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 1.6, 5]} />
        <OrbitControls 
          enableZoom={false} 
          maxPolarAngle={Math.PI / 2} 
          minPolarAngle={Math.PI / 3}
          enableDamping
          dampingFactor={0.05}
        />
        
        {/* Ambient light for general illumination */}
        <ambientLight intensity={0.5} />
        
        {/* Directional light for shadows */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* Ground */}
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#a3a3a3" />
        </mesh>

        {/* Store entrance */}
        <Suspense fallback={null}>
          <Entrance />
        </Suspense>
      </Suspense>
    </Canvas>
  );
} 