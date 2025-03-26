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
  console.log('=== LOADER STARTED ===');
  
  if (!context.storefront) {
    console.error('=== ERROR: Storefront context is missing ===');
    return {
      shop: null,
      product: null,
      error: 'Storefront API is not configured'
    };
  }

  console.log('=== STOREFRONT CONTEXT AVAILABLE ===');
  const {storefront} = context;
  
  try {
    // First, let's get a list of all products to see what's available
    const LIST_PRODUCTS_QUERY = `#graphql
      query {
        products(first: 10) {
          edges {
            node {
              id
              title
              handle
              availableForSale
            }
          }
        }
      }
    `;

    console.log('=== ATTEMPTING TO FETCH ALL PRODUCTS ===');
    let productsResult;
    try {
      productsResult = await storefront.query(LIST_PRODUCTS_QUERY);
      console.log('=== AVAILABLE PRODUCTS ===', JSON.stringify(productsResult, null, 2));
    } catch (productsError) {
      console.error('=== ERROR FETCHING PRODUCTS ===', productsError);
      throw productsError;
    }

    // Now try to get our specific product
    console.log('=== ATTEMPTING TO FETCH SPECIFIC PRODUCT ===');
    let productResult;
    try {
      productResult = await storefront.query(PRODUCT_QUERY, {
        variables: {
          handle: 'test-chair',
        },
      });
      console.log('=== SPECIFIC PRODUCT RESULT ===', JSON.stringify(productResult, null, 2));
    } catch (productError) {
      console.error('=== ERROR FETCHING SPECIFIC PRODUCT ===', productError);
      throw productError;
    }
    
    const {product} = productResult;
    
    if (!product) {
      console.error('=== ERROR: Product not found ===');
      return {
        shop: storefront.query(SHOP_QUERY),
        product: null,
        error: 'Product not found'
      };
    }

    // Check for 3D model in both model3d field and media
    const model3d = product.model3d || 
      product.media?.edges?.find((edge: MediaEdge) => edge.node?.__typename === 'Model3d')?.node;

    if (!model3d) {
      console.error('=== ERROR: Product has no 3D model data ===', {
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
    console.error('=== ERROR: Failed to fetch product ===', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
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

  console.log('=== LOADER DATA ===', { 
    shop: shop ? 'Loading shop data...' : null, 
    product: product ? { id: product.id, title: product.title } : null, 
    error 
  });

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

  // Check if product has the required properties
  if (!product.model3d && !product.media?.edges?.some((edge: MediaEdge) => edge.node?.__typename === 'Model3d')) {
    console.error('=== ERROR: Product has no 3D model ===', product);
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-600">3D Model Not Available</h1>
          <p className="mt-2 text-gray-600">This product does not have a 3D model attached.</p>
          <p className="mt-4 text-sm text-gray-500">
            Please add a 3D model to the product in your Shopify admin.
          </p>
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
      publishedAt
      status
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
      onlineStoreUrl
      availableForSale
      totalInventory
    }
  }
`;
