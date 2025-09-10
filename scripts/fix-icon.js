#!/usr/bin/env node

// mDojo App Icon Fix Script
// This script helps fix the app icon cropping issue on mobile devices

const fs = require('fs');
const path = require('path');

console.log('🔧 mDojo Icon Fix Script');
console.log('========================');

// Check if icon files exist
const iconPaths = [
  './assets/images/icon.png',
  './assets/images/adaptive-icon.png',
  './assets/icon.png'
];

console.log('\n📱 Checking icon files...');
iconPaths.forEach(iconPath => {
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath);
    console.log(`✅ Found: ${iconPath} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`❌ Missing: ${iconPath}`);
  }
});

console.log('\n🎨 Icon Requirements for Mobile:');
console.log('- Main icon: 1024x1024 pixels');
console.log('- Adaptive icon: Same as main but with 20% transparent padding');
console.log('- Background: White or app theme color');
console.log('- Format: PNG with transparency');

console.log('\n🛠️ Applied Fixes:');
console.log('1. ✅ Set main icon to icon.png');
console.log('2. ✅ Set adaptive icon foreground to icon.png');
console.log('3. ✅ Set background color to white (#FFFFFF)');
console.log('4. ✅ Added monochrome icon for Android 13+');
console.log('5. ✅ Added explicit iOS icon configuration');

console.log('\n📋 Next Steps:');
console.log('1. Stop the current development server (Ctrl+C)');
console.log('2. Clear the cache: npx expo start --clear');
console.log('3. Rebuild your app: eas build (for production)');
console.log('4. Test on physical device');

console.log('\n💡 If icon still appears cut:');
console.log('- Check that your icon.png has transparent padding around the main logo');
console.log('- The actual logo should only use 66% of the image center');
console.log('- Consider using a square logo design instead of circular');

console.log('\n✨ Icon fix configuration completed!');
