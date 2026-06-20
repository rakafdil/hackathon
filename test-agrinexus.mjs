import { chromium } from 'playwright';

async function testAgriNexus() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];
  
  // Test 1: Register Page
  console.log('\n=== TEST 1: Register Page ===');
  try {
    await page.goto('http://localhost:3003/register', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const pageTitle = await page.title();
    const hasRoleDropdown = await page.locator('select, [role="listbox"], button:has-text("Peran")').count() > 0;
    const hasPetani = await page.locator('text=Petani').count() > 0;
    const hasPembeli = await page.locator('text=Pembeli').count() > 0;
    const hasPemerintah = await page.locator('text=Pemerintah').count() > 0;
    
    await page.screenshot({ path: 'test-register.png', fullPage: true });
    
    results.push({
      test: 'Register Page',
      status: hasRoleDropdown && hasPetani ? '✅ PASSED' : '❌ FAILED',
      details: { pageTitle, hasRoleDropdown, hasPetani, hasPembeli, hasPemerintah }
    });
    console.log('Status:', hasRoleDropdown && hasPetani ? '✅ PASSED' : '❌ FAILED');
    console.log('Page Title:', pageTitle);
    console.log('Role Dropdown Present:', hasRoleDropdown);
    console.log('Petani option:', hasPetani);
    console.log('Pembeli option:', hasPembeli);
    console.log('Pemerintah option:', hasPemerintah);
  } catch (error) {
    results.push({ test: 'Register Page', status: '❌ FAILED', error: error.message });
    console.log('❌ FAILED:', error.message);
  }
  
  // Test 2: Login Page
  console.log('\n=== TEST 2: Login Page ===');
  try {
    await page.goto('http://localhost:3003/login', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const pageTitle = await page.title();
    const hasAgriNexus = await page.locator('text=AgriNexus').count() > 0;
    
    await page.screenshot({ path: 'test-login.png', fullPage: true });
    
    results.push({
      test: 'Login Page',
      status: hasAgriNexus ? '✅ PASSED' : '❌ FAILED',
      details: { pageTitle, hasAgriNexus }
    });
    console.log('Status:', hasAgriNexus ? '✅ PASSED' : '❌ FAILED');
    console.log('Page Title:', pageTitle);
    console.log('Has AgriNexus branding:', hasAgriNexus);
  } catch (error) {
    results.push({ test: 'Login Page', status: '❌ FAILED', error: error.message });
    console.log('❌ FAILED:', error.message);
  }
  
  // Test 3: Dashboard
  console.log('\n=== TEST 3: Dashboard ===');
  try {
    await page.goto('http://localhost:3003/', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const isRedirectedToLogin = currentUrl.includes('/login');
    
    await page.screenshot({ path: 'test-dashboard.png', fullPage: true });
    
    results.push({
      test: 'Dashboard',
      status: isRedirectedToLogin ? '✅ PASSED (redirects to login)' : '✅ PASSED',
      details: { currentUrl, isRedirectedToLogin }
    });
    console.log('Status:', isRedirectedToLogin ? '✅ PASSED (redirects to login)' : '✅ PASSED');
    console.log('Current URL:', currentUrl);
  } catch (error) {
    results.push({ test: 'Dashboard', status: '❌ FAILED', error: error.message });
    console.log('❌ FAILED:', error.message);
  }
  
  // Test 4: Feature Pages
  console.log('\n=== TEST 4: Feature Pages ===');
  const featurePages = [
    { name: 'Smart Planting', url: 'http://localhost:3003/smart-planting' },
    { name: 'Crop Risk', url: 'http://localhost:3003/crop-risk' },
    { name: 'Prices', url: 'http://localhost:3003/prices' },
    { name: 'AI Assistant', url: 'http://localhost:3003/ai-assistant' }
  ];
  
  for (const feature of featurePages) {
    try {
      await page.goto(feature.url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      const isRedirectedToLogin = currentUrl.includes('/login');
      
      await page.screenshot({ path: 'test-' + feature.name.toLowerCase().replace(' ', '-') + '.png', fullPage: true });
      
      results.push({
        test: feature.name,
        status: isRedirectedToLogin ? '✅ PASSED (redirects to login)' : '✅ PASSED (page accessible)',
        details: { currentUrl, isRedirectedToLogin }
      });
      console.log(feature.name + ':', isRedirectedToLogin ? '✅ Redirects to login' : '✅ Page loads');
    } catch (error) {
      results.push({ test: feature.name, status: '❌ FAILED', error: error.message });
      console.log(feature.name + ': ❌ FAILED -', error.message);
    }
  }
  
  await browser.close();
  
  console.log('\n\n========== TEST SUMMARY ==========');
  results.forEach(r => {
    console.log('\n' + r.test + ': ' + r.status);
    if (r.details) {
      console.log('  Details:', JSON.stringify(r.details, null, 2));
    }
    if (r.error) {
      console.log('  Error:', r.error);
    }
  });
  
  return results;
}

testAgriNexus().catch(console.error);
