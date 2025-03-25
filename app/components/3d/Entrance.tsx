import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Group, Mesh } from 'three';

export function Entrance() {
  console.log('Rendering Entrance component');
  
  const groupRef = useRef<Group>(null);
  const textRef = useRef<Mesh>(null);

  useEffect(() => {
    console.log('Entrance component mounted');
    return () => console.log('Entrance component unmounted');
  }, []);

  // Animate the floating text
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1 + 2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Store entrance structure */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        {/* Main building */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 3, 0.2]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>

        {/* Door frame */}
        <mesh position={[0, -0.5, 0.1]}>
          <boxGeometry args={[1.2, 2, 0.2]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>

        {/* Door */}
        <mesh position={[0, -0.5, 0.2]}>
          <boxGeometry args={[1, 1.8, 0.1]} />
          <meshStandardMaterial color="#4a2511" />
        </mesh>
      </mesh>

      {/* Floating "Enter" text */}
      <Text
        ref={textRef}
        position={[0, 2, 1]}
        fontSize={0.5}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        renderOrder={1}
      >
        ENTER
      </Text>
    </group>
  );
} 