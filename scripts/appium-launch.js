const fs = require('fs');
const path = require('path');
const wdio = require('webdriverio');

async function main() {
  const capsPath = path.resolve(__dirname, '..', 'appium', 'capabilities.android.json');
  const capabilities = JSON.parse(fs.readFileSync(capsPath, 'utf8'));

  const client = await wdio.remote({
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    capabilities
  });

  try {
    // Ensure app is launched and in foreground
    const appPackage = capabilities['appium:appPackage'];
    if (appPackage) {
      try { await client.activateApp(appPackage); } catch {}
    }

    // Wait for Start button by accessibility id
    const startBtn = await client.$('~startWorkoutButton');
    if (!(await startBtn.isExisting())) {
      console.log('Waiting for startWorkoutButton up to 25s...');
      await startBtn.waitForExist({ timeout: 25000, interval: 500 });
    }

    // Fallback: search by text
    let clickable = startBtn;
    if (!(await startBtn.isExisting())) {
      console.log('Fallback: trying text selector for "Start Workout"');
      const byText = await client.$("android=new UiSelector().textContains(\"Start Workout\")");
      if (await byText.isExisting()) clickable = byText;
    }

    await clickable.click();
    console.log('Tapped Start Workout.');
  } finally {
    await client.deleteSession();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
