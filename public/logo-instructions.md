# Logo Replacement Instructions

## Current Status
The logo files are currently SVG placeholders. To use your actual uploaded logo:

## Steps to Replace with Your PNG Logo

1. **Locate your logo file** (the red and black wing symbol PNG with transparent background)

2. **Copy it to the public folder:**
   ```bash
   cp /path/to/your/logo.png /Users/charliewhite/CascadeProjects/windsurf-project/creative-hub/public/logo.png
   ```

3. **The code is already set up to use `/logo.png` or `/logo.svg`**
   - Just name your file `logo.png` and place it in `/public/`
   - The transparent background will work in both light and dark themes

## Logo Specifications
- **Format:** PNG with transparent background
- **Colors:** Red (#EF4444) and Black (#1F2937) wings
- **Aspect Ratio:** Maintain original proportions
- **Recommended Size:** At least 512x512px for quality

## Current Usage
- Login/Register: 96x96px display
- Sidebar: 28x28px display (maintains aspect ratio)
- Favicon: 32x32px

All sizes maintain aspect ratio automatically.
