# The Third Dimension

A revolutionary 3D ecommerce experience built with Shopify Hydrogen and Shopify Oxygen, offering an immersive virtual shopping environment for modern home furnishings.

The store can be found at https://the-third-dimension.xyz

The myshopify.com URL for backend is bsbunj-hc.myshopify.com

## About

The Third Dimension is a cutting-edge virtual furniture store that brings the physical shopping experience into the digital realm. Specializing in contemporary homewares - from furniture and decor to tableware - our platform offers a unique first-person shopping experience that bridges the gap between traditional retail and ecommerce.

## Brand Identity

- **Colors**: Orange and White
- **Design Philosophy**: Minimalistic, brutalistic, square aesthetics
- **Target Audience**: Tech-savvy millennials and Gen Z, familiar with video game controls
- **Experience**: Immersive, interactive, and intuitive

## Features

### Immersive 3D Shopping Experience
- First-person perspective navigation
- Real-time 3D product visualization
- Interactive product displays
- Virtual store environment

### Dynamic Lighting System
Eight distinct lighting modes for different shopping atmospheres:
- Morning (lights on/off)
- Midday (lights on/off) (default)
- Afternoon (lights on/off)
- Night (lights on/off) (hidden)

### Interactive Controls

#### Movement
- WASD keys for directional movement
- Arrow keys alternative control scheme
- Mouse click navigation to specific floor positions

#### Product Interaction
- Floating interactive icons above products
- "Add to Cart" functionality
- "View" mode for detailed product examination

### Product View Features
- Split-screen detailed view
  - Left: Interactive 3D model
    - Rotation controls
    - Product manipulation
    - Interactive elements (where applicable)
  - Right: Product information
    - Price
    - Dimensions
    - Materials
    - Additional specifications

## Technical Stack

- **Frontend**: Shopify Hydrogen
- **Hosting**: Shopify Oxygen
- **3D Rendering**: Three.js/WebGL
- **eCommerce Backend**: Shopify

## Getting Started

### Prerequisites

- Node.js 16.14.0 or higher
- npm 8.0.0 or higher
- Git
- A Shopify Partner account
- A Shopify store (development or production)

### Installation

1. Create a new Hydrogen project:
```bash
npm create @shopify/hydrogen@latest
```

2. During the setup process:
   - Name your project: "thethirddimension"
   - Choose "Default Demo Template"
   - Select your preferred language (TypeScript recommended)
   - Choose your styling solution (Tailwind CSS recommended)

3. Navigate to the project directory:
```bash
cd thethirddimension
```

4. Install additional dependencies:
```bash
npm install three @react-three/fiber @react-three/drei @types/three
```

5. Set up your environment variables:
   - Create a `.env` file in the root directory
   - Add your Shopify store credentials:
```env
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN=your_storefront_api_token
```

### Development

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and visit:
```
http://localhost:3000
```

### Project Structure

```
thethirddimension/
├── app/
│   ├── components/     # React components
│   ├── routes/        # Route components
│   ├── styles/        # CSS and styling files
│   └── lib/           # Utility functions and hooks
├── public/            # Static assets
│   └── models/        # 3D models and textures
└── package.json
```

### Configuration

1. Shopify Setup:
   - Go to your Shopify Partner dashboard
   - Create a new store or link existing store
   - Generate Storefront API access token
   - Update `.env` file with credentials

2. 3D Environment Setup:
   - Place 3D models in `public/models/`
   - Configure lighting presets in `app/lib/lighting.ts`
   - Set up camera controls in `app/lib/controls.ts`

### Deployment

1. Connect your GitHub repository to Shopify Oxygen:
   - Go to your Shopify admin
   - Navigate to Online Store > Hosting
   - Follow the deployment instructions

2. Or deploy manually:
```bash
npm run build
npm run deploy
```

## Contributing

[Contribution guidelines to be added]

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The MIT License is a permissive license that is short and to the point. It lets people do anything they want with your code as long as they provide attribution back to you and don't hold you liable.
