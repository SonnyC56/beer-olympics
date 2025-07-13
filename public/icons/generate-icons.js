// Node.js script to generate proper PNG icons
// This would need to be run with a library like node-canvas or sharp
// For now, we'll use the SVG approach

const sizes = [72, 144];

sizes.forEach(size => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#ff1493"/>
  <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size * 0.3}" text-anchor="middle" dominant-baseline="middle" fill="white" font-weight="bold">BO</text>
</svg>`;
  
  console.log(`SVG for ${size}x${size}:`, svg);
});