/**
 * Generate sample RUM (Real User Monitoring) data for testing
 * 
 * This script simulates realistic Web Vitals metrics and sends them to the /api/rum endpoint
 * to populate the database for testing the dashboard and queries.
 * 
 * Usage: tsx scripts/generate-rum-data.ts
 */

const API_URL = 'http://localhost:3000/api/rum';

// Sample URLs to simulate different pages
const SAMPLE_URLS = [
  'http://localhost:3000/',
  'http://localhost:3000/dashboard',
  'http://localhost:3000/contracts',
  'http://localhost:3000/upload',
  'http://localhost:3000/knowledge-base',
  'http://localhost:3000/subscription',
  'http://localhost:3000/support',
  'http://localhost:3000/admin',
];

// Navigation types
const NAV_TYPES = ['navigate', 'reload', 'back-forward', 'prerender'];

/**
 * Generate realistic LCP (Largest Contentful Paint) value
 * Good: < 2500ms, Needs Improvement: 2500-4000ms, Poor: > 4000ms
 */
function generateLCP(): { value: number; rating: string } {
  const rand = Math.random();
  if (rand < 0.7) {
    // 70% good
    return {
      value: Math.random() * 2500,
      rating: 'good',
    };
  } else if (rand < 0.9) {
    // 20% needs improvement
    return {
      value: 2500 + Math.random() * 1500,
      rating: 'needs-improvement',
    };
  } else {
    // 10% poor
    return {
      value: 4000 + Math.random() * 3000,
      rating: 'poor',
    };
  }
}

/**
 * Generate realistic CLS (Cumulative Layout Shift) value
 * Good: < 0.1, Needs Improvement: 0.1-0.25, Poor: > 0.25
 */
function generateCLS(): { value: number; rating: string } {
  const rand = Math.random();
  if (rand < 0.75) {
    // 75% good
    return {
      value: Math.random() * 0.1,
      rating: 'good',
    };
  } else if (rand < 0.92) {
    // 17% needs improvement
    return {
      value: 0.1 + Math.random() * 0.15,
      rating: 'needs-improvement',
    };
  } else {
    // 8% poor
    return {
      value: 0.25 + Math.random() * 0.5,
      rating: 'poor',
    };
  }
}

/**
 * Generate realistic INP (Interaction to Next Paint) value
 * Good: < 200ms, Needs Improvement: 200-500ms, Poor: > 500ms
 */
function generateINP(): { value: number; rating: string } {
  const rand = Math.random();
  if (rand < 0.8) {
    // 80% good
    return {
      value: Math.random() * 200,
      rating: 'good',
    };
  } else if (rand < 0.95) {
    // 15% needs improvement
    return {
      value: 200 + Math.random() * 300,
      rating: 'needs-improvement',
    };
  } else {
    // 5% poor
    return {
      value: 500 + Math.random() * 1000,
      rating: 'poor',
    };
  }
}

/**
 * Send a metric to the RUM API
 */
async function sendMetric(
  name: string,
  value: number,
  rating: string,
  url: string,
  navigationType: string
): Promise<boolean> {
  const payload = {
    name,
    value,
    rating,
    delta: Math.random() * 100, // Random delta
    id: `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    navigationType,
    url,
    timestamp: Date.now(),
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Failed to send ${name}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Network error sending ${name}:`, error);
    return false;
  }
}

/**
 * Generate and send sample data
 */
async function generateSampleData(count: number = 50) {
  console.log(`🚀 Generating ${count} sample RUM metrics...`);
  console.log(`📡 API Endpoint: ${API_URL}\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < count; i++) {
    const url = SAMPLE_URLS[Math.floor(Math.random() * SAMPLE_URLS.length)];
    const navType = NAV_TYPES[Math.floor(Math.random() * NAV_TYPES.length)];

    // Generate metrics for this page visit
    const lcp = generateLCP();
    const cls = generateCLS();
    const inp = generateINP();

    // Send LCP
    const lcpSuccess = await sendMetric('LCP', lcp.value, lcp.rating, url, navType);
    if (lcpSuccess) successCount++;
    else failCount++;

    // Send CLS (stored as integer, multiply by 1000)
    const clsSuccess = await sendMetric('CLS', cls.value * 1000, cls.rating, url, navType);
    if (clsSuccess) successCount++;
    else failCount++;

    // Send INP
    const inpSuccess = await sendMetric('INP', inp.value, inp.rating, url, navType);
    if (inpSuccess) successCount++;
    else failCount++;

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`✓ Generated ${(i + 1) * 3} metrics (${i + 1} page visits)`);
    }

    // Small delay to avoid overwhelming the rate limiter
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log(`\n✅ Complete!`);
  console.log(`   Success: ${successCount} metrics`);
  console.log(`   Failed: ${failCount} metrics`);
  console.log(`\n📊 View dashboard at: http://localhost:3000/admin/web-vitals`);
}

// Run the script
const count = parseInt(process.argv[2]) || 50;
generateSampleData(count).catch(console.error);

