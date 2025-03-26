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
  
  try {
    const {product} = await storefront.query(PRODUCT_QUERY, {
      variables: {
        handle: 'test-chair',
      },
    });
    
    console.log('Fetched product data:', JSON.stringify(product, null, 2));
    
    if (!product) {
      console.error('No product found with handle: test-chair');
      throw new Error('Product not found');
    }

    if (!product.model3d) {
      console.error('Product has no 3D model data:', product);
      throw new Error('Product has no 3D model');
    }
    
    return defer({
      shop: storefront.query(SHOP_QUERY),
      product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export default function Homepage() {
  console.log('Rendering Homepage');
  const {shop, product} = useLoaderData<typeof loader>();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
      <div className="absolute inset-0">
        <Experience product={product} />
      </div>
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

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      model3d {
        url
        alt
        previewImage {
          url
        }
        sources {
          url
          format
          mimeType
          filesize
        }
      }
      media(first: 10) {
        edges {
          node {
            ... on Model3d {
              url
              alt
              previewImage {
                url
              }
              sources {
                url
                format
                mimeType
                filesize
              }
            }
          }
        }
      }
    }
  }
`;
