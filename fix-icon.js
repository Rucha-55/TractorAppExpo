// Icon Fix Guidelines for mDojo App
// 
// PROBLEM: App icon appears cut/cropped on mobile devices
// SOLUTION: Proper adaptive icon configuration
//
// REQUIREMENTS for Android Adaptive Icons:
// 1. Icon should only use center 66% of the image (safe area)
// 2. Outer 33% should be transparent padding
// 3. Icon size should be 1024x1024 pixels
// 4. Background color should complement the icon
//
// CURRENT CONFIGURATION:
// - Main icon: "./assets/images/adaptive-icon.png"
// - Background color: "#E31937" (mDojo red theme)
// - Monochrome icon: "./assets/images/icon.png"
//
// FIXES APPLIED:
// 1. Changed main icon to use adaptive-icon.png
// 2. Set background color to mDojo red (#E31937)
// 3. Added monochrome image for better compatibility
// 4. Added explicit icon path for both Android and iOS
//
// TO CREATE PROPER ADAPTIVE ICON:
// 1. Take your original icon
// 2. Resize it to fit in center 66% area (about 676x676 pixels in a 1024x1024 canvas)
// 3. Add transparent padding around it
// 4. Save as adaptive-icon.png
//
// ALTERNATIVE SOLUTION:
// If you want to use a simple icon without adaptive features:
// Set adaptiveIcon to false in app.json and use regular icon

console.log("Icon configuration has been updated!");
console.log("Please rebuild your app to see the changes:");
console.log("1. For development: expo start");
console.log("2. For production build: eas build");
