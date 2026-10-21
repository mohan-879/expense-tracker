/**
 * ClubFund Performance & Load Testing Suite
 * Benchmarks API response times, latency percentiles, throughput (req/sec), and concurrency handling.
 */

const http = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5000;
const BASE_HOST = '127.0.0.1';
const JWT_SECRET = process.env.JWT_SECRET || 'clubfund_super_secret_jwt_key_2026_dev';

let authToken = '';

async function obtainAuthToken() {
  // First attempt: direct login via API
  const loginPayload = JSON.stringify({
    login: 'admin@clubfund.edu',
    password: 'admin123',
  });

  const apiToken = await new Promise((resolve) => {
    const req = http.request(
      {
        hostname: BASE_HOST,
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginPayload),
        },
        timeout: 5000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.success && parsed.data && parsed.data.token) {
              resolve(parsed.data.token);
              return;
            }
          } catch (e) {}
          resolve(null);
        });
      }
    );
    req.on('error', () => resolve(null));
    req.write(loginPayload);
    req.end();
  });

  if (apiToken) {
    console.log('🔑 Authenticated successfully via /api/auth/login');
    return apiToken;
  }

  // Second attempt: query MongoDB to find any active admin/user and sign token
  try {
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      const User = require('./models/User');
      const user = await User.findOne({ isActive: true });
      if (user) {
        const token = jwt.sign(
          { id: user._id, role: user.role, email: user.email },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        await mongoose.connection.close();
        console.log(`🔑 Generated authenticated JWT for user: ${user.email} (${user.role})`);
        return token;
      }
      await mongoose.connection.close();
    }
  } catch (err) {
    console.warn('⚠️ Could not query MongoDB directly for user:', err.message);
  }

  // Fallback token
  return jwt.sign({ id: '665123456789abcdef123456', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
}

function makeRequest(path, method = 'GET') {
  return new Promise((resolve) => {
    const startTime = process.hrtime.bigint();
    const options = {
      hostname: BASE_HOST,
      port: PORT,
      path,
      method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const latencyMs = Number(endTime - startTime) / 1e6;
        resolve({
          statusCode: res.statusCode,
          latencyMs,
          success: res.statusCode >= 200 && res.statusCode < 400,
          bytes: Buffer.byteLength(data),
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const endTime = process.hrtime.bigint();
      resolve({
        statusCode: 408,
        latencyMs: Number(endTime - startTime) / 1e6,
        success: false,
        bytes: 0,
        error: 'Timeout',
      });
    });

    req.on('error', (err) => {
      const endTime = process.hrtime.bigint();
      resolve({
        statusCode: 500,
        latencyMs: Number(endTime - startTime) / 1e6,
        success: false,
        bytes: 0,
        error: err.message,
      });
    });

    req.end();
  });
}

async function runScenario(scenarioName, endpoint, totalRequests, concurrency) {
  console.log(`\n============================================================`);
  console.log(`🚀 Scenario: ${scenarioName}`);
  console.log(`📍 Target: http://${BASE_HOST}:${PORT}${endpoint}`);
  console.log(`📊 Total Requests: ${totalRequests} | Concurrency: ${concurrency}`);
  console.log(`============================================================`);

  const latencies = [];
  let successful = 0;
  let failed = 0;
  let totalBytes = 0;
  let inFlight = 0;
  let requestsSent = 0;

  const wallClockStart = Date.now();

  const executeBatch = async () => {
    const promises = [];
    while (requestsSent < totalRequests) {
      if (inFlight >= concurrency) {
        await Promise.race(promises);
      }
      requestsSent++;
      inFlight++;

      const p = makeRequest(endpoint).then((res) => {
        inFlight--;
        latencies.push(res.latencyMs);
        totalBytes += res.bytes;
        if (res.success) {
          successful++;
        } else {
          failed++;
        }
        promises.splice(promises.indexOf(p), 1);
      });

      promises.push(p);
    }
    await Promise.all(promises);
  };

  await executeBatch();

  const totalTimeSec = (Date.now() - wallClockStart) / 1000;
  latencies.sort((a, b) => a - b);

  const avgLatency = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
  const minLatency = latencies[0] || 0;
  const maxLatency = latencies[latencies.length - 1] || 0;
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.90)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = (totalRequests / (totalTimeSec || 1)).toFixed(2);

  console.log(`\n📈 Results:`);
  console.log(`   ⏱️  Total Duration:      ${totalTimeSec.toFixed(2)}s`);
  console.log(`   ⚡ Throughput:          ${rps} req/sec`);
  console.log(`   ✅ Successful Requests:  ${successful} (${((successful / totalRequests) * 100).toFixed(1)}%)`);
  console.log(`   ❌ Failed Requests:      ${failed}`);
  console.log(`   📦 Data Transferred:    ${(totalBytes / 1024).toFixed(1)} KB`);
  console.log(`\n⏳ Latency Distribution:`);
  console.log(`   • Min:                 ${minLatency.toFixed(2)} ms`);
  console.log(`   • Average:             ${avgLatency.toFixed(2)} ms`);
  console.log(`   • Median (p50):        ${p50.toFixed(2)} ms`);
  console.log(`   • 90th Percentile:     ${p90.toFixed(2)} ms`);
  console.log(`   • 95th Percentile:     ${p95.toFixed(2)} ms`);
  console.log(`   • 99th Percentile:     ${p99.toFixed(2)} ms`);
  console.log(`   • Max:                 ${maxLatency.toFixed(2)} ms`);

  return {
    scenarioName,
    endpoint,
    totalRequests,
    concurrency,
    durationSec: totalTimeSec,
    rps: Number(rps),
    successful,
    failed,
    avgLatency,
    p95,
  };
}

async function runAllTests() {
  console.log(`============================================================`);
  console.log(`🧪 Starting ClubFund Backend Load & Performance Test Suite`);
  console.log(`============================================================`);

  authToken = await obtainAuthToken();

  const scenarios = [
    { name: 'Health Check Baseline', endpoint: '/api/health', count: 100, concurrency: 10 },
    { name: 'Financial Summary API', endpoint: '/api/reports/financial-summary', count: 50, concurrency: 5 },
    { name: 'Expenses List Query', endpoint: '/api/expenses?page=1&limit=25', count: 50, concurrency: 5 },
    { name: 'Events List & Budget', endpoint: '/api/events', count: 50, concurrency: 5 },
    { name: 'Audit Logs Feed', endpoint: '/api/audit-logs', count: 50, concurrency: 5 },
  ];

  const summary = [];
  for (const s of scenarios) {
    try {
      const res = await runScenario(s.name, s.endpoint, s.count, s.concurrency);
      summary.push(res);
    } catch (err) {
      console.error(`Error running scenario ${s.name}:`, err.message);
    }
  }

  console.log(`\n============================================================`);
  console.log(`🏆 OVERALL LOAD TEST SUMMARY`);
  console.log(`============================================================`);
  console.table(
    summary.map((s) => ({
      Scenario: s.scenarioName,
      Reqs: s.totalRequests,
      Concurrency: s.concurrency,
      RPS: s.rps,
      AvgMs: `${s.avgLatency.toFixed(1)}ms`,
      P95Ms: `${s.p95.toFixed(1)}ms`,
      PassRate: `${((s.successful / s.totalRequests) * 100).toFixed(0)}%`,
    }))
  );
  console.log(`============================================================\n`);
}

runAllTests().catch((err) => {
  console.error('Fatal load test error:', err);
});
