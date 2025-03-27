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
  
  console.log('SceneContent received product:', {
    hasProduct: !!product,
    hasModel3d: !!product?.model3d,
    modelUrl: product?.model3d?.url,
    modelAlt: product?.model3d?.alt
  });
  
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
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[50, 0.2, 50]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>

      {/* Back wall */}
      <mesh receiveShadow position={[0, 25, -25]}>
        <boxGeometry args={[50, 50, 0.2]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>

      {/* Origin sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#ff0000" />
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
  console.log('Scene component received props:', {
    hasProduct: !!props.product,
    hasModel3d: !!props.product?.model3d,
    modelUrl: props.product?.model3d?.url,
    modelAlt: props.product?.model3d?.alt
  });
  
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