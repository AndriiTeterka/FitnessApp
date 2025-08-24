const { remote } = require('webdriverio');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FormData = require('form-data');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, '..', '.appium-screens');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Load Cloudinary configuration from config file
const configPath = path.join(__dirname, '..', 'config', 'cloudinary.json');
let cloudinaryConfig = { uploadScreenshots: false };

try {
  if (fs.existsSync(configPath)) {
    cloudinaryConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('Loaded Cloudinary config from file');
  }
} catch (error) {
  console.log('Could not load Cloudinary config file:', error.message);
}

// Configuration from file or fallback to environment variables
const shouldUpload = cloudinaryConfig.uploadScreenshots || process.env.CLOUDINARY_UPLOAD_SCREENSHOTS === '1';
const cloudName = cloudinaryConfig.cloudName || process.env.CLOUDINARY_CLOUD_NAME;
const unsignedPreset = cloudinaryConfig.unsignedPreset || process.env.CLOUDINARY_UNSIGNED_PRESET;
const manifestPath = path.join(screenshotsDir, 'manifest.json');

function readManifest() {
  try {
    if (fs.existsSync(manifestPath)) {
      return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }
  } catch (_) {}
  return [];
}

function generateSignature(params, apiSecret) {
  return crypto.createHash('sha256').update(params + apiSecret).digest('hex');
}

async function appendManifest(entry) {
  const data = readManifest();
  data.push(entry);
  await fs.promises.writeFile(manifestPath, JSON.stringify(data, null, 2));
  console.log(`Added to manifest: ${entry.page}-${entry.position} at ${entry.url}`);
}

async function deleteAllCloudinaryImages() {
  const apiKey = cloudinaryConfig.apiKey || process.env.CLOUDINARY_API_KEY;
  const apiSecret = cloudinaryConfig.apiSecret || process.env.CLOUDINARY_API_SECRET;
  console.log(`Cleanup check: shouldUpload=${shouldUpload}, cloudName=${cloudName}, apiKey=${!!apiKey}, apiSecret=${!!apiSecret}`);
  if (!(shouldUpload && cloudName)) {
    console.log('Cleanup skipped: upload not enabled or cloud name missing');
    return;
  }
  
  try {
    console.log('Cleaning up previous Cloudinary images...');
    const apiKey = cloudinaryConfig.apiKey || process.env.CLOUDINARY_API_KEY;
    const apiSecret = cloudinaryConfig.apiSecret || process.env.CLOUDINARY_API_SECRET;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=500`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(apiKey + ':' + apiSecret).toString('base64')}`
      }
    });
    
    if (!res.ok) {
      console.log('Could not fetch images for cleanup (API credentials may not be set)');
      return;
    }
    
    const data = await res.json();
    const publicIds = data.resources?.map(r => r.public_id) || [];
    
    if (publicIds.length > 0) {
      console.log(`Found ${publicIds.length} images to delete...`);
      
      // Delete images one by one using the correct admin API
      for (let publicId of publicIds) {
        const apiKey = cloudinaryConfig.apiKey || process.env.CLOUDINARY_API_KEY;
        const apiSecret = cloudinaryConfig.apiSecret || process.env.CLOUDINARY_API_SECRET;
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signature = generateSignature(`public_id=${publicId}&timestamp=${timestamp}`, apiSecret);
        
        const deleteRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            public_id: publicId,
            api_key: apiKey,
            timestamp: timestamp,
            signature: signature
          })
        });
        
        if (deleteRes.ok) {
          const result = await deleteRes.json();
          console.log(`Deleted image: ${publicId} - ${result.result}`);
        } else {
          const errorData = await deleteRes.json();
          console.log(`Could not delete ${publicId}: ${errorData.error?.message || 'Unknown error'}`);
        }
      }
      
      console.log(`Cleanup completed: ${publicIds.length} images processed`);
    } else {
      console.log('No previous images found to delete');
    }
  } catch (error) {
    console.log('Cleanup skipped (API credentials may not be set):', error.message);
  }
}

async function uploadToCloudinary(filePath) {
  if (!(shouldUpload && cloudName)) return null;

  const base64 = await fs.promises.readFile(filePath, { encoding: 'base64' });
  
  // Try signed upload first
  const apiKey = cloudinaryConfig.apiKey || process.env.CLOUDINARY_API_KEY;
  const apiSecret = cloudinaryConfig.apiSecret || process.env.CLOUDINARY_API_SECRET;
  
  console.log(`Upload method: apiKey=${!!apiKey}, apiSecret=${!!apiSecret}`);
  
  if (apiKey && apiSecret) {
    // Use signed upload
    console.log('Using signed upload method');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const cleanPublicId = `screenshot-${Date.now()}`;
    
    // Generate signature with all parameters that need to be signed
    const paramsToSign = `public_id=${cleanPublicId}&timestamp=${timestamp}`;
    const signature = generateSignature(paramsToSign, apiSecret);
    
    const formData = new URLSearchParams();
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('public_id', cleanPublicId);
    formData.append('file', `data:image/png;base64,${base64}`);

    console.log('Form data being sent (signed):');
    console.log('api_key:', apiKey);
    console.log('timestamp:', timestamp);
    console.log('signature:', signature);
    console.log('public_id:', cleanPublicId);
    console.log('file: [base64 data]');

    console.log(`Uploading to Cloudinary: cloudName=${cloudName}`);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData 
    });
    const json = await res.json();
    
    if (!res.ok) {
      console.log(`Upload failed with status ${res.status}:`, json);
      throw new Error(json.error?.message || 'Cloudinary upload failed');
    }
    
    console.log('Upload successful:', json.public_id);
    return {
      url: json.secure_url || json.url,
      publicId: json.public_id,
      width: json.width,
      height: json.height,
    };
  } else {
    throw new Error('No upload method available - missing API credentials');
  }
}

async function maybeUploadAndRecord(page, position, filePath) {
  if (!shouldUpload) return null;
  if (!cloudName || !unsignedPreset) {
    console.warn('Upload enabled, but Cloudinary config missing; skipping upload');
    return null;
  }
  try {
    const r = await uploadToCloudinary(filePath);
    if (r?.url) {
      const entry = { page, position, localPath: filePath, ...r, timestamp: new Date().toISOString() };
      await appendManifest(entry);
      console.log(`Uploaded ${page}-${position}: ${r.url}`);
    }
    return r;
  } catch (e) {
    console.warn(`Upload failed for ${page}-${position}: ${e.message}`);
    return null;
  }
}

async function captureHomeScreenshot() {
  let driver;
  
  try {
    // Clean up previous Cloudinary images before starting
    console.log('About to call cleanup function...');
    await deleteAllCloudinaryImages();
    console.log('Cleanup function completed');
    
    console.log('Starting Appium session for Home page...');
    
    // Initialize driver
    driver = await remote({
      hostname: '127.0.0.1',
      port: 4723,
      capabilities: {
        platformName: 'Android',
        'appium:deviceName': 'R5CY20BA53B',
        'appium:udid': 'R5CY20BA53B',
        'appium:automationName': 'UiAutomator2',
        'appium:appPackage': 'com.andriiteterka.andriiteterkaapp',
        'appium:appActivity': '.MainActivity',
        'appium:appWaitActivity': '.*',
        'appium:appWaitForLaunch': true,
        'appium:noReset': true,
        'appium:newCommandTimeout': 240,
        'appium:autoGrantPermissions': true
      }
    });

    // Activate the app
    await driver.activateApp('com.andriiteterka.andriiteterkaapp');
    console.log('App activated');

    // Wait for app to load
    await driver.pause(2000);

    // Check if we're already on the Home page by looking for "Good Morning!" text
    const homeText = await driver.findElements('-android uiautomator', 'new UiSelector().textContains("Good Morning!")');
    
    if (homeText.length > 0) {
      console.log('Already on Home page, proceeding with screenshot...');
    } else {
      console.log('Not on Home page, navigating...');
      // Try to find and click Home tab
      const homeTab = await driver.findElements('-android uiautomator', 'new UiSelector().text("Home")');
      if (homeTab.length > 0) {
        await driver.elementClick(homeTab[0].ELEMENT);
        await driver.pause(1000);
      }
    }

    // Wait for Start Workout button to be visible
    console.log('Waiting for Start Workout button...');
    let startButton = null;
    for (let i = 0; i < 10; i++) {
      const buttons = await driver.findElements('accessibility id', 'startWorkoutButton');
      if (buttons.length > 0) {
        startButton = buttons[0];
        break;
      }
      await driver.pause(500);
    }

    if (!startButton) {
      console.log('Start Workout button not found, taking screenshot anyway...');
    } else {
      console.log('Start Workout button found');
    }

    // Take initial screenshot (top of page)
    console.log('Taking initial screenshot (top of page)...');
    const initialScreenshot = await driver.takeScreenshot();
    const initialScreenshotPath = path.join(screenshotsDir, 'home-top.png');
    fs.writeFileSync(initialScreenshotPath, initialScreenshot, 'base64');
    console.log(`Initial screenshot saved: ${initialScreenshotPath}`);
    await maybeUploadAndRecord('home', 'top', initialScreenshotPath);

    // Get initial page source (silently) - suppress XML output
    const originalStdout = process.stdout.write;
    process.stdout.write = () => {}; // Suppress stdout temporarily
    const initialPageSource = await driver.getPageSource();
    process.stdout.write = originalStdout; // Restore stdout
    const initialSourcePath = path.join(screenshotsDir, 'home-top.xml');
    fs.writeFileSync(initialSourcePath, initialPageSource);
    console.log('Initial page source captured (saved to file)');

    // Check if page is scrollable and scroll to bottom using W3C Actions API
    console.log('Checking if page is scrollable...');
    try {
      // Get screen dimensions
      const windowSize = await driver.getWindowSize();
      const screenHeight = windowSize.height;
      const screenWidth = windowSize.width;
      
      // Calculate scroll coordinates (from bottom to top to scroll down)
      const startY = Math.floor(screenHeight * 0.8); // Start from 80% down
      const endY = Math.floor(screenHeight * 0.2);   // End at 20% from top
      const centerX = Math.floor(screenWidth / 2);   // Center horizontally
      
      console.log(`Scrolling from Y=${startY} to Y=${endY} at X=${centerX}`);
      
      // Use W3C Actions API for scrolling
      await driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: centerX, y: startY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerMove', duration: 1000, x: centerX, y: endY },
            { type: 'pointerUp', button: 0 }
          ]
        }
      ]);
      
      // Wait for scroll animation to complete
      await driver.pause(1000);
      
      console.log('Scroll completed, taking bottom screenshot...');
      
      // Take screenshot after scrolling (bottom of page)
      const bottomScreenshot = await driver.takeScreenshot();
      const bottomScreenshotPath = path.join(screenshotsDir, 'home-bottom.png');
      fs.writeFileSync(bottomScreenshotPath, bottomScreenshot, 'base64');
      console.log(`Bottom screenshot saved: ${bottomScreenshotPath}`);
      await maybeUploadAndRecord('home', 'bottom', bottomScreenshotPath);
      
      // Get page source after scrolling (silently) - suppress XML output
      const originalStdout = process.stdout.write;
      process.stdout.write = () => {}; // Suppress stdout temporarily
      const bottomPageSource = await driver.getPageSource();
      process.stdout.write = originalStdout; // Restore stdout
      const bottomSourcePath = path.join(screenshotsDir, 'home-bottom.xml');
      fs.writeFileSync(bottomSourcePath, bottomPageSource);
      console.log('Bottom page source captured (saved to file)');
      
      // Scroll back to top
      console.log('Scrolling back to top...');
      await driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: centerX, y: endY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerMove', duration: 1000, x: centerX, y: startY },
            { type: 'pointerUp', button: 0 }
          ]
        }
      ]);
      
      await driver.pause(1000);
      console.log('Scrolled back to top');
      
    } catch (scrollError) {
      console.log('Page might not be scrollable or scroll failed:', scrollError.message);
      console.log('Taking additional screenshot without scroll...');
      
      // Take another screenshot without scrolling as fallback
      const fallbackScreenshot = await driver.takeScreenshot();
      const fallbackScreenshotPath = path.join(screenshotsDir, 'home-fallback.png');
      fs.writeFileSync(fallbackScreenshotPath, fallbackScreenshot, 'base64');
      console.log(`Fallback screenshot saved: ${fallbackScreenshotPath}`);
      await maybeUploadAndRecord('home', 'fallback', fallbackScreenshotPath);
    }

    console.log('Home page capture completed successfully!');
    
    // Display latest manifest entries
    if (shouldUpload) {
      const manifest = readManifest();
      const latestEntries = manifest.slice(-4); // Last 4 entries (top + bottom for 2 pages)
      console.log('\n=== Latest Screenshot URLs ===');
      latestEntries.forEach(entry => {
        console.log(`${entry.page}-${entry.position}: ${entry.url}`);
      });
      console.log('==============================\n');
    }
  } catch (error) {
    console.error('Error capturing Home page:', error);
  } finally {
    if (driver) {
      await driver.deleteSession();
      console.log('Session closed');
    }
  }
}

captureHomeScreenshot();
