import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {Experience} from '~/components/3d/Experience';

export function meta() {
  return [
    {title: 'The Third Dimension | Home'},
    {description: 'A revolutionary 3D ecommerce experience'},
  ];
}

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  
  return defer({
    shop: storefront.query(SHOP_QUERY),
  });
}

export default function Homepage() {
  console.log('Rendering Homepage');
  const {shop} = useLoaderData<typeof loader>();

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden">
      <Experience />
    </div>
  );
}

const SHOP_QUERY = `#graphql
  query layout {
    shop {
      name
      description
    }
  }
`;
