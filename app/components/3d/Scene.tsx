import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
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
        position={[0, 15, 30]} 
        fov={75}
        near={0.1}
        far={1000}
      />
      <OrbitControls 
        enableZoom={true} 
        maxPolarAngle={Math.PI / 2} 
        minPolarAngle={0}
        enableDamping
        dampingFactor={0.05}
        target={[0, 0, 0]}
        enablePan={true}
        enableRotate={true}
        mouseButtons={{
          LEFT: 0,
          MIDDLE: 1,
          RIGHT: 2
        }}
      />
      
      {/* Ambient light for general illumination */}
      <ambientLight intensity={1.0} />
      
      {/* Directional light for shadows */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-near={0.1}
      />
      
      {/* Ground */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[50, 0.2, 50]} />
        <meshStandardMaterial color="#0000ff" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* North wall */}
      <mesh receiveShadow position={[0, 25, -25]}>
        <boxGeometry args={[50, 50, 0.2]} />
        <meshStandardMaterial color="#006400" metalness={0.2} roughness={0.8} />
      </mesh>
      <Text
        position={[0, 45, -25]}
        fontSize={2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        NORTH
      </Text>

      {/* East wall */}
      <mesh receiveShadow position={[25, 25, 0]}>
        <boxGeometry args={[0.2, 50, 50]} />
        <meshStandardMaterial color="#800080" metalness={0.2} roughness={0.8} />
      </mesh>
      <Text
        position={[25, 45, 0]}
        fontSize={2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
      >
        EAST
      </Text>

      {/* West wall */}
      <mesh receiveShadow position={[-25, 25, 0]}>
        <boxGeometry args={[0.2, 50, 50]} />
        <meshStandardMaterial color="#ffa500" metalness={0.2} roughness={0.8} />
      </mesh>
      <Text
        position={[-25, 45, 0]}
        fontSize={2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        rotation={[0, -Math.PI / 2, 0]}
      >
        WEST
      </Text>

      {/* Origin sphere */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ff0000" metalness={0.2} roughness={0.8} />
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