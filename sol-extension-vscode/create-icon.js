const fs = require('fs');

// Create a simple SVG icon
const svgIcon = `
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2196F3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="16" fill="url(#grad1)"/>
  <text x="64" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">SOL</text>
  <text x="64" y="75" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white">YAML</text>
  <text x="64" y="95" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white">Support</text>
</svg>
`;

// Write SVG to file
fs.writeFileSync('icon.svg', svgIcon);
console.log('SVG icon created: icon.svg');
console.log('You can convert it to PNG using online tools or ImageMagick if available'); 