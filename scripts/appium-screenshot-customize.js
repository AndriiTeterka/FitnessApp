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

// Optional upload to Cloudinary and manifest recording
const envUploadRaw = (process.env.CLOUDINARY_UPLOAD_SCREENSHOTS ?? '').toString().toLowerCase();
const shouldUpload = !!(envUploadRaw && envUploadRaw !== '0' && envUploadRaw !== 'false');
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const unsignedPreset = process.env.CLOUDINARY_UNSIGNED_PRESET;
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
  if (!(shouldUpload && cloudName)) return;
  
  try {
    console.log('Cleaning up previous Cloudinary images...');
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=500`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.CLOUDINARY_API_KEY + ':' + process.env.CLOUDINARY_API_SECRET).toString('base64')}`
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
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signature = generateSignature(`public_id=${publicId}&timestamp=${timestamp}`, process.env.CLOUDINARY_API_SECRET);
        
        const deleteRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            public_id: publicId,
            api_key: process.env.CLOUDINARY_API_KEY,
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
  if (!(shouldUpload && cloudName && unsignedPreset)) return null;

  const base64 = await fs.promises.readFile(filePath, { encoding: 'base64' });
  const form = new FormData();
  form.append('upload_preset', unsignedPreset);
  form.append('file', `data:image/png;base64,${base64}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Cloudinary upload failed');
  return {
    url: json.secure_url || json.url,
    publicId: json.public_id,
    width: json.width,
    height: json.height,
  };
}

async function maybeUploadAndRecord(page, position, filePath) {
  if (!shouldUpload) return null;
  if (!cloudName || !unsignedPreset) {
    console.warn('UPLOAD_SCREENSHOTS=1 set, but CLOUDINARY env vars missing; skipping upload');
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

async function captureCustomizeScreenshot() {
  let driver;
  
  try {
    // Clean up previous Cloudinary images before starting
    await deleteAllCloudinaryImages();
    
    console.log('Starting Appium session for Customize Workout page...');
    
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

    // Check if we're already on the Customize Workout page
    const customizeText = await driver.findElements('-android uiautomator', 'new UiSelector().textContains("Customize Workout")');
    
    if (customizeText.length > 0) {
      console.log('Already on Customize Workout page, proceeding with screenshot...');
    } else {
      console.log('Not on Customize Workout page, navigating...');
      
      // First check if we're on Home page
      const homeText = await driver.findElements('-android uiautomator', 'new UiSelector().textContains("Good Morning!")');
      
      if (homeText.length > 0) {
        console.log('On Home page, clicking Start Workout...');
        // Find and click Start Workout button
        const startButton = await driver.findElements('accessibility id', 'startWorkoutButton');
        if (startButton.length > 0) {
          await driver.elementClick(startButton[0].ELEMENT);
          console.log('Clicked Start Workout button');
          await driver.pause(2000);
        } else {
          console.log('Start Workout button not found');
        }
      } else {
        console.log('Not on Home page, trying to navigate to Home first...');
        // Try to find and click Home tab
        const homeTab = await driver.findElements('-android uiautomator', 'new UiSelector().text("Home")');
        if (homeTab.length > 0) {
          await driver.elementClick(homeTab[0].ELEMENT);
          await driver.pause(1000);
          
          // Now try to click Start Workout
          const startButton = await driver.findElements('accessibility id', 'startWorkoutButton');
          if (startButton.length > 0) {
            await driver.elementClick(startButton[0].ELEMENT);
            console.log('Clicked Start Workout button');
            await driver.pause(2000);
          }
        }
      }
    }

    // Wait for Customize Workout page to load
    console.log('Waiting for Customize Workout page...');
    let customizeHeader = null;
    for (let i = 0; i < 10; i++) {
      const headers = await driver.findElements('-android uiautomator', 'new UiSelector().textContains("Customize Workout")');
      if (headers.length > 0) {
        customizeHeader = headers[0];
        break;
      }
      await driver.pause(500);
    }

    if (!customizeHeader) {
      console.log('Customize Workout page not found, taking screenshot anyway...');
    } else {
      console.log('Customize Workout page found');
    }

    // Take initial screenshot (top of page)
    console.log('Taking initial screenshot (top of page)...');
    const initialScreenshot = await driver.takeScreenshot();
    const initialScreenshotPath = path.join(screenshotsDir, 'customize-top.png');
    fs.writeFileSync(initialScreenshotPath, initialScreenshot, 'base64');
    console.log(`Initial screenshot saved: ${initialScreenshotPath}`);
    await maybeUploadAndRecord('customize', 'top', initialScreenshotPath);

    // Get initial page source (silently) - suppress XML output
    const originalStdout = process.stdout.write;
    process.stdout.write = () => {}; // Suppress stdout temporarily
    const initialPageSource = await driver.getPageSource();
    process.stdout.write = originalStdout; // Restore stdout
    const initialSourcePath = path.join(screenshotsDir, 'customize-top.xml');
    fs.writeFileSync(initialSourcePath, initialPageSource);

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
      const bottomScreenshotPath = path.join(screenshotsDir, 'customize-bottom.png');
      fs.writeFileSync(bottomScreenshotPath, bottomScreenshot, 'base64');
      console.log(`Bottom screenshot saved: ${bottomScreenshotPath}`);
      await maybeUploadAndRecord('customize', 'bottom', bottomScreenshotPath);
      
            // Get page source after scrolling (silently) - suppress XML output
      const originalStdout = process.stdout.write;
      process.stdout.write = () => {}; // Suppress stdout temporarily
      const bottomPageSource = await driver.getPageSource();
      process.stdout.write = originalStdout; // Restore stdout
      const bottomSourcePath = path.join(screenshotsDir, 'customize-bottom.xml');
      fs.writeFileSync(bottomSourcePath, bottomPageSource);

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
      const fallbackScreenshotPath = path.join(screenshotsDir, 'customize-fallback.png');
      fs.writeFileSync(fallbackScreenshotPath, fallbackScreenshot, 'base64');
      console.log(`Fallback screenshot saved: ${fallbackScreenshotPath}`);
      await maybeUploadAndRecord('customize', 'fallback', fallbackScreenshotPath);
    }

    console.log('Customize Workout page capture completed successfully!');
    
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
    console.error('Error capturing Customize Workout page:', error);
  } finally {
    if (driver) {
      await driver.deleteSession();
      console.log('Session closed');
    }
  }
}

captureCustomizeScreenshot();
