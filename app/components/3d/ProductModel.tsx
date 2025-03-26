import { useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

interface ProductModelProps {
  url: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

export function ProductModel({ url, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] }: ProductModelProps) {
  console.log('Loading 3D model from URL:', url);
  
  if (!url) {
    console.error('No URL provided to ProductModel component');
    return null;
  }

  try {
    const { scene } = useGLTF(url);
    console.log('Successfully loaded 3D model:', scene);

    if (!scene) {
      console.error('No scene found in loaded 3D model');
      return null;
    }

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
  } catch (error) {
    console.error('Error loading 3D model:', error);
    return null;
  }
} 