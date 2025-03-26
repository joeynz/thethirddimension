import { Suspense, Component, type ReactNode, useEffect, useState } from 'react';
import {Scene} from './Scene';
import { ProductModel } from './ProductModel';

interface ExperienceProps {
  product?: {
    model3d?: {
      url?: string;
      alt?: string;
    };
  };
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error in 3D scene:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-red-50 text-red-500">
          <div>
            Failed to load 3D experience. Please refresh the page.
            <pre className="mt-2 text-sm">
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function Experience({ product }: ExperienceProps) {
  console.log('Rendering Experience component with product:', product);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <div>Loading 3D experience...</div>
      </div>
    );
  }

  if (!product) {
    console.error('No product data provided to Experience component');
    return (
      <div className="flex h-full w-full items-center justify-center bg-yellow-50 text-yellow-500">
        <div>No product data available.</div>
      </div>
    );
  }

  if (!product.model3d?.url) {
    console.error('No 3D model URL found in product:', product);
    return (
      <div className="flex h-full w-full items-center justify-center bg-yellow-50 text-yellow-500">
        <div>No 3D model available for this product.</div>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full">
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <div>Loading 3D scene...</div>
          </div>
        }>
          <Scene product={product} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 