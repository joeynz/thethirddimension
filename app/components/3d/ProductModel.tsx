import { useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

interface ProductModelProps {
  url: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

export function ProductModel({ url, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] }: ProductModelProps) {
  const { scene } = useGLTF(url);

  return (
    <Suspense fallback={null}>
      <primitive 
        object={scene} 
        position={position}
        scale={scale}
        rotation={rotation}
      />
    </Suspense>
  );
} 