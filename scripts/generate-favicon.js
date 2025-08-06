import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Main function to generate favicon
async function generateFavicon() {
  // Path to the logo and output favicon
  const logoPath = path.join(__dirname, '../public/logo.png');
  const faviconPath = path.join(__dirname, '../public/favicon.ico');

  console.log('Generating favicon.ico from logo.png...');

  try {
    // Check if logo.png exists
    if (!fs.existsSync(logoPath)) {
      console.error('Error: logo.png not found in public directory');
      process.exit(1);
    }

    // Create a temporary directory for the favicon generation
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Use sharp if available, otherwise fallback to other methods
    try {
      // Try to use npm to install sharp temporarily if not already installed
      execSync('npm list sharp || npm install --no-save sharp', { stdio: 'inherit' });
      
      // Now use sharp to create the favicon
      const sharpModule = await import('sharp');
      const sharp = sharpModule.default;
      
      // Create favicon with multiple sizes (16x16, 32x32, 48x48)
      await Promise.all([
        sharp(logoPath).resize(16, 16).toFile(path.join(tempDir, 'favicon-16.png')),
        sharp(logoPath).resize(32, 32).toFile(path.join(tempDir, 'favicon-32.png')),
        sharp(logoPath).resize(48, 48).toFile(path.join(tempDir, 'favicon-48.png'))
      ]);
      
      // Use the ico-converter package to combine the PNGs into an ICO file
      execSync('npm list ico-converter || npm install --no-save ico-converter', { stdio: 'inherit' });
      const icoConverterModule = await import('ico-converter');
      const icoConverter = icoConverterModule.default;
      
      await icoConverter.convert([
        path.join(tempDir, 'favicon-16.png'),
        path.join(tempDir, 'favicon-32.png'),
        path.join(tempDir, 'favicon-48.png')
      ], faviconPath);
      
      console.log('Favicon generated successfully at:', faviconPath);
      
      // Clean up temp directory
      fs.rmSync(tempDir, { recursive: true, force: true });
      
    } catch (error) {
      console.error('Error using sharp, trying alternative method:', error.message);
      
      // Alternative method: copy the logo.png to favicon.ico as a fallback
      // This won't be a proper .ico file but better than nothing
      fs.copyFileSync(logoPath, faviconPath);
      console.log('Created basic favicon by copying logo.png (not ideal but functional)');
    }
  } catch (error) {
    console.error('Error generating favicon:', error.message);
  }
}

// Run the main function
generateFavicon().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
