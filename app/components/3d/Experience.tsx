import { Suspense, Component, type ReactNode, useEffect, useState } from 'react';
import {Scene} from './Scene';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Error in 3D scene:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-red-50 text-red-500">
          <div>Failed to load 3D experience. Please refresh the page.</div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function Experience() {
  console.log('Rendering Experience component');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div>Loading 3D experience...</div>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-full bg-gray-100">
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center bg-gray-100">
            <div>Loading 3D scene...</div>
          </div>
        }>
          <Scene />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 