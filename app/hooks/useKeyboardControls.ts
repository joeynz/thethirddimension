import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

const MOVEMENT_SPEED = 0.1;

export function useKeyboardControls() {
  const { camera } = useThree();
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveForward.current = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveBackward.current = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveLeft.current = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveRight.current = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveForward.current = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveBackward.current = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveLeft.current = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveRight.current = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const moveCamera = () => {
      const direction = new Vector3();
      camera.getWorldDirection(direction);

      if (moveForward.current) {
        camera.position.addScaledVector(direction, MOVEMENT_SPEED);
      }
      if (moveBackward.current) {
        camera.position.addScaledVector(direction, -MOVEMENT_SPEED);
      }
      if (moveLeft.current) {
        camera.position.addScaledVector(direction.cross(new Vector3(0, 1, 0)), -MOVEMENT_SPEED);
      }
      if (moveRight.current) {
        camera.position.addScaledVector(direction.cross(new Vector3(0, 1, 0)), MOVEMENT_SPEED);
      }

      requestAnimationFrame(moveCamera);
    };

    moveCamera();
  }, [camera]);
} 