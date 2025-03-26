import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {Experience} from '~/components/3d/Experience';

interface MediaEdge {
  node: {
    __typename: string;
    url?: string;
    alt?: string;
    previewImage?: {
      url: string;
    };
    sources?: Array<{
      url: string;
      format: string;
      mimeType: string;
      filesize: number;
    }>;
  };
}

export function meta() {
  return [
    {title: 'The Third Dimension | Home'},
    {description: 'A revolutionary 3D ecommerce experience'},
  ];
}

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  
  try {
    // First, try to fetch by ID
    const ID_QUERY = `#graphql
      query Product($id: ID!) {
        product(id: $id) {
          id
          title
          handle
        }
      }
    `;

    // Log to both server and client
    console.log('=== PRODUCT LOADER START ===');
    console.log('Attempting to fetch product with ID: gid://shopify/Product/8186562805941');
    
    const idResult = await storefront.query(ID_QUERY, {
      variables: {
        id: 'gid://shopify/Product/8186562805941',
      },
    });
    
    // Log the raw response
    console.log('=== ID QUERY RESULT ===');
    console.log(JSON.stringify(idResult, null, 2));

    if (!idResult.product) {
      console.error('=== ERROR: Product not found with ID query ===');
      return {
        shop: storefront.query(SHOP_QUERY),
        product: null,
        error: 'Product not found'
      };
    }

    // If we found the product, now try the full query
    console.log('=== Product found, fetching full details ===');
    const {product} = await storefront.query(PRODUCT_QUERY, {
      variables: {
        handle: idResult.product.handle,
      },
    });
    
    // Log the full product response
    console.log('=== FULL PRODUCT RESPONSE ===');
    console.log(JSON.stringify(product, null, 2));
    
    // Check for 3D model in both model3d field and media
    const model3d = product.model3d || 
      product.media?.edges?.find((edge: MediaEdge) => edge.node?.__typename === 'Model3d')?.node;

    if (!model3d) {
      console.error('=== ERROR: Product has no 3D model data ===');
      console.error({
        hasModel3d: !!product.model3d,
        hasMedia: !!product.media,
        mediaEdges: product.media?.edges?.length,
        mediaTypes: product.media?.edges?.map((edge: MediaEdge) => edge.node?.__typename)
      });
      return {
        shop: storefront.query(SHOP_QUERY),
        product: {
          ...product,
          model3d: null
        },
        error: 'Product has no 3D model'
      };
    }
    
    console.log('=== PRODUCT LOADER SUCCESS ===');
    return {
      shop: storefront.query(SHOP_QUERY),
      product: {
        ...product,
        model3d
      },
      error: null
    };
  } catch (error) {
    console.error('=== ERROR: Failed to fetch product ===');
    console.error(error);
    return {
      shop: storefront.query(SHOP_QUERY),
      product: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export default function Homepage() {
  console.log('=== RENDERING HOMEPAGE ===');
  const {shop, product, error} = useLoaderData<typeof loader>();

  if (error) {
    console.error('=== ERROR IN HOMEPAGE ===', error);
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Product</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <p className="mt-4 text-sm text-gray-500">
            Please make sure the product "test-chair" exists and has a 3D model attached.
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    console.error('=== ERROR: No product data ===');
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-600">Product Not Found</h1>
          <p className="mt-2 text-gray-600">Could not find product with handle "test-chair"</p>
        </div>
      </div>
    );
  }

  console.log('=== RENDERING 3D EXPERIENCE ===');
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
            __typename
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
            ... on MediaImage {
              url
              alt
            }
          }
        }
      }
      variants(first: 1) {
        edges {
          node {
            id
            price {
              amount
            }
          }
        }
      }
    }
  }
`;
