import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Entrance } from './Entrance';
import { Suspense } from 'react';
import { useKeyboardControls } from '~/hooks/useKeyboardControls';
import { ProductModel } from './ProductModel';

interface SceneProps {
  product?: {
    model3d?: {
      url?: string;
      alt?: string;
    };
  };
}

function SceneContent({ product }: SceneProps) {
  useKeyboardControls();
  
  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[0, 2, 5]} 
        fov={75}
        near={0.1}
        far={1000}
      />
      <OrbitControls 
        enableZoom={false} 
        maxPolarAngle={Math.PI / 2} 
        minPolarAngle={Math.PI / 3}
        enableDamping
        dampingFactor={0.05}
        target={[0, 1.5, 0]}
      />
      
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.7} />
      
      {/* Directional light for shadows */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-near={0.1}
      />
      
      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#a3a3a3" />
      </mesh>

      {/* Store entrance */}
      <Suspense fallback={null}>
        <Entrance />
      </Suspense>

      {/* Product model */}
      {product?.model3d?.url && (
        <Suspense fallback={null}>
          <ProductModel 
            url={product.model3d.url}
            position={[0, 0, 0]}
            scale={[1, 1, 1]}
            rotation={[0, 0, 0]}
          />
        </Suspense>
      )}
    </>
  );
}

export function Scene(props: SceneProps) {
  console.log('Rendering Scene component with props:', props);
  
  return (
    <div className="relative h-full w-full">
      {/* Store name overlay */}
      <div className="absolute left-8 top-8 z-10 text-4xl font-bold text-white drop-shadow-lg">
        The Third Dimension
      </div>
      
      <Canvas shadows className="h-full w-full">
        <Suspense fallback={null}>
          <SceneContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
} 