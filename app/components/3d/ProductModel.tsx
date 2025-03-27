import { useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

interface ProductModelProps {
  url: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

export function ProductModel({ url, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] }: ProductModelProps) {
  console.log('ProductModel component received URL:', url);
  console.log('ProductModel props:', { url, position, scale, rotation });
  
  if (!url) {
    console.error('No URL provided to ProductModel component');
    return null;
  }

  try {
    console.log('Attempting to load 3D model from URL:', url);
    const { scene } = useGLTF(url);
    console.log('Successfully loaded 3D model:', {
      scene,
      hasChildren: scene?.children?.length,
      position: scene?.position,
      rotation: scene?.rotation,
      scale: scene?.scale
    });

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
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return null;
  }
} 