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

## Project Structure

```
thethirddimension/
├── app/
│   ├── components/     # React components
│   │   ├── Scene/     # 3D scene components
│   │   ├── UI/        # User interface components
│   │   └── Layout/    # Layout components
│   ├── routes/        # Route components
│   ├── styles/        # CSS and styling files
│   └── lib/           # Utility functions and hooks
│       ├── lighting.ts # Lighting system configuration
│       └── controls.ts # Camera and movement controls
├── public/            # Static assets
│   └── models/        # 3D models and textures
└── package.json
```

## Development

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/joeynz/thethirddimension.git
cd thethirddimension
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:3000
```

### Environment Variables

The project requires the following environment variables in `.env`:
```env
PUBLIC_STORE_DOMAIN=bsbunj-hc.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN=your_storefront_api_token
```

## Deployment

The project is automatically deployed to Shopify Oxygen when changes are pushed to the main branch. No manual deployment steps are required.

## Contributing

[Contribution guidelines to be added]

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The MIT License is a permissive license that is short and to the point. It lets people do anything they want with your code as long as they provide attribution back to you and don't hold you liable.
