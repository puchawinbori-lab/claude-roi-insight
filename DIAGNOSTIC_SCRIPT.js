/**
 * PRODUCTION DIAGNOSTIC SCRIPT
 *
 * Copy and paste this entire script into your browser console (F12 → Console tab)
 * when you're on the production site to diagnose connection issues.
 */

(async function diagnoseProduction() {
  console.clear();
  console.log('\n' + '='.repeat(70));
  console.log('🔍 CLAUDE ROI INSIGHT - PRODUCTION DIAGNOSTIC TOOL');
  console.log('='.repeat(70) + '\n');

  // 1. Check current environment
  console.log('📍 STEP 1: Environment Check');
  console.log('-'.repeat(70));
  console.log('Current URL:', window.location.href);
  console.log('Hostname:', window.location.hostname);
  console.log('Protocol:', window.location.protocol);
  console.log('Is localhost?', window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  console.log('');

  // 2. Check environment variables
  console.log('📍 STEP 2: Environment Variables');
  console.log('-'.repeat(70));
  const envMode = import.meta?.env?.MODE || 'unknown';
  const viteApiUrl = import.meta?.env?.VITE_API_URL || 'NOT SET';
  const resolvedApiUrl = viteApiUrl !== 'NOT SET' ? viteApiUrl : 'http://localhost:5000';

  console.log('Environment Mode:', envMode);
  console.log('VITE_API_URL (env):', viteApiUrl);
  console.log('Resolved API URL:', resolvedApiUrl);
  console.log('');

  // 3. Critical check - localhost in production?
  console.log('📍 STEP 3: Configuration Validation');
  console.log('-'.repeat(70));
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const isUsingLocalhost = resolvedApiUrl.includes('localhost') || resolvedApiUrl.includes('127.0.0.1');

  if (isProduction && isUsingLocalhost) {
    console.error('❌ CRITICAL ERROR: Using localhost backend in production!');
    console.error('   This WILL NOT WORK.');
    console.error('   Frontend:', window.location.hostname);
    console.error('   Backend:', resolvedApiUrl);
    console.error('');
    console.error('   FIX: Set VITE_API_URL environment variable in your deployment.');
    console.error('');
  } else {
    console.log('✅ Configuration looks OK');
  }
  console.log('');

  // 4. Test backend health endpoint
  console.log('📍 STEP 4: Backend Health Check');
  console.log('-'.repeat(70));
  const healthUrl = `${resolvedApiUrl}/api/health`;
  console.log('Testing:', healthUrl);

  try {
    const startTime = performance.now();
    const response = await fetch(healthUrl);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    console.log('Response status:', response.status, response.statusText);
    console.log('Response time:', responseTime + 'ms');
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is healthy!');
      console.log('Response data:', data);
    } else {
      console.error('❌ Backend returned error status:', response.status);
      const text = await response.text();
      console.error('Response body:', text);
    }
  } catch (error) {
    console.error('❌ Failed to connect to backend!');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('');

    if (error instanceof TypeError) {
      console.error('This is a TypeError - typical causes:');
      console.error('1. Backend server is not running or not accessible');
      console.error('2. CORS is blocking the request');
      console.error('3. Network/firewall issue');
      console.error('4. Incorrect backend URL');
    }
  }
  console.log('');

  // 5. Test CORS preflight
  console.log('📍 STEP 5: CORS Preflight Test');
  console.log('-'.repeat(70));
  const testUrl = `${resolvedApiUrl}/api/fetch-jira`;
  console.log('Testing OPTIONS request to:', testUrl);

  try {
    const response = await fetch(testUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log('OPTIONS response status:', response.status);
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    };
    console.log('CORS headers:', corsHeaders);

    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log('✅ CORS appears to be configured');
    } else {
      console.warn('⚠️  No CORS headers detected - this may cause issues');
    }
  } catch (error) {
    console.error('❌ CORS preflight failed:', error.message);
  }
  console.log('');

  // 6. Summary
  console.log('📍 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(70));

  const issues = [];

  if (isProduction && isUsingLocalhost) {
    issues.push('❌ Using localhost backend in production (CRITICAL)');
  }

  if (viteApiUrl === 'NOT SET' && isProduction) {
    issues.push('⚠️  VITE_API_URL not set (using default)');
  }

  if (issues.length === 0) {
    console.log('✅ No obvious configuration issues detected');
    console.log('   If you\'re still having problems:');
    console.log('   - Check if backend is running');
    console.log('   - Verify backend is accessible from this location');
    console.log('   - Check backend logs for errors');
  } else {
    console.log('Issues found:');
    issues.forEach(issue => console.log('  ' + issue));
  }

  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('   1. Fix any issues listed above');
  console.log('   2. If backend health check failed, verify backend is running');
  console.log('   3. Try submitting the form again');
  console.log('   4. Check browser Network tab for failed requests');
  console.log('');
  console.log('='.repeat(70) + '\n');

})().catch(err => {
  console.error('Diagnostic script error:', err);
});
