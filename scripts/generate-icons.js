const fs = require('fs');
const path = require('path');

// Create the scripts directory if it doesn't exist
const scriptsDir = path.join(process.cwd(), 'scripts');
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Create icon directory if it doesn't exist
const iconDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// This is a simple function to generate a placeholder SVG icon
function generateIconSVG(size) {
  const fontSize = Math.floor(size / 5);
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#000"/>
    <text x="50%" y="50%" font-family="Arial" font-size="${fontSize}px" fill="white" text-anchor="middle" dominant-baseline="middle">VJ</text>
  </svg>`;
}

// Generate icons of different sizes
const sizes = [192, 256, 384, 512];

sizes.forEach(size => {
  const svgContent = generateIconSVG(size);
  const filePath = path.join(iconDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`Generated icon: ${filePath}`);
});

console.log('Icons generation complete!'); 