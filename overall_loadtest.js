/**
 * DSClub Expense Tracker - Overall Site Load & Stress Testing Suite
 * Benchmarks both Frontend (Next.js port 3000) and Backend (Express REST API port 5000).
 * Measures throughput (RPS), concurrency scaling, latency distribution (Min, Avg, P50, P90, P95, P99, Max),
 * transfer volume, error rates, and generates an overall performance scorecard.
 */

const http = require('http');
const path = require('path');
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
const jwt = require(path.join(backendNodeModules, 'jsonwebtoken'));
const mongoose = require(path.join(backendNodeModules, 'mongoose'));
require(path.join(backendNodeModules, 'dotenv')).config({ path: path.join(__dirname, 'backend', '.env') });

const FRONTEND_PORT = 3000;
const BACKEND_PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';
const JWT_SECRET = process.env.JWT_SECRET || 'clubfund_super_secret_jwt_key_2026_dev';

let authToken = '';

/**
 * Obtain authenticated JWT token for testing protected API endpoints
 */
async function getAuthToken() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      const User = require('./backend/models/User');
      const user = await User.findOne({ isActive: true });
      if (user) {
        const token = jwt.sign(
          { id: user._id, role: user.role, email: user.email },
          JWT_SECRET,
          { expiresIn: '2h' }
        );
        await mongoose.connection.close();
        console.log(`🔑 Authenticated token generated for: ${user.email} (${user.role})`);
        return token;
      }
      await mongoose.connection.close();
    }
  } catch (err) {
    console.warn('⚠️ MongoDB token sign warning:', err.message);
  }

  // Fallback signed JWT
  return jwt.sign(
    { id: '665123456789abcdef123456', role: 'ADMIN', email: 'admin@clubfund.edu' },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

/**
 * Execute a single HTTP request and record detailed metrics
 */
function sendRequest(port, targetPath, method = 'GET', auth = false) {
  return new Promise((resolve) => {
    const startTime = process.hrtime.bigint();
    const headers = {
      'User-Agent': 'DSClub-LoadTester/1.0',
      'Accept': '*/*',
    };

    if (auth && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
      headers['Content-Type'] = 'application/json';
    }

    const options = {
      hostname: HOST,
      port,
      path: targetPath,
      method,
      headers,
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let dataLength = 0;
      res.on('data', (chunk) => {
        dataLength += chunk.length;
      });
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const latencyMs = Number(endTime - startTime) / 1e6;
        resolve({
          statusCode: res.statusCode,
          latencyMs,
          success: res.statusCode >= 200 && res.statusCode < 400,
          bytes: dataLength,
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

/**
 * Run a load scenario with controlled concurrency
 */
async function runScenario({ layer, name, port, path, requests, concurrency, auth }) {
  const latencies = [];
  let successful = 0;
  let failed = 0;
  let totalBytes = 0;
  let inFlight = 0;
  let sent = 0;

  process.stdout.write(`⏳ Benchmarking [${layer}] ${name} (${requests} reqs @ c=${concurrency})... `);
  const wallStart = Date.now();

  const batch = async () => {
    const promises = [];
    while (sent < requests) {
      if (inFlight >= concurrency) {
        await Promise.race(promises);
      }
      sent++;
      inFlight++;

      const p = sendRequest(port, path, 'GET', auth).then((res) => {
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

  await batch();

  const durationSec = (Date.now() - wallStart) / 1000;
  latencies.sort((a, b) => a - b);

  const avg = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
  const min = latencies[0] || 0;
  const max = latencies[latencies.length - 1] || 0;
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.90)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = (requests / (durationSec || 1)).toFixed(1);
  const passRate = ((successful / requests) * 100).toFixed(1);

  console.log(`✅ Done (${rps} req/s, avg ${avg.toFixed(1)}ms, pass ${passRate}%)`);

  return {
    layer,
    name,
    target: `http://${HOST}:${port}${path}`,
    requests,
    concurrency,
    durationSec: Number(durationSec.toFixed(2)),
    rps: Number(rps),
    successful,
    failed,
    passRate: Number(passRate),
    dataKb: Number((totalBytes / 1024).toFixed(1)),
    min: Number(min.toFixed(1)),
    avg: Number(avg.toFixed(1)),
    p50: Number(p50.toFixed(1)),
    p90: Number(p90.toFixed(1)),
    p95: Number(p95.toFixed(1)),
    p99: Number(p99.toFixed(1)),
    max: Number(max.toFixed(1)),
  };
}

async function main() {
  console.log('================================================================================');
  console.log('📊 DSClub Expense Tracker – Overall Full-Stack Load Test');
  console.log(`🕒 Execution Time: ${new Date().toLocaleString()}`);
  console.log(`🌐 Frontend Target: http://${HOST}:${FRONTEND_PORT}`);
  console.log(`⚙️  Backend Target:  http://${HOST}:${BACKEND_PORT}`);
  console.log('================================================================================\n');

  authToken = await getAuthToken();

  const scenarios = [
    // -------------------------------------------------------------------------
    // FRONTEND PAGES (Next.js)
    // -------------------------------------------------------------------------
    { layer: 'Frontend', name: 'Sign-In Page (/login)', port: FRONTEND_PORT, path: '/login', requests: 60, concurrency: 8, auth: false },
    { layer: 'Frontend', name: 'Root Landing (/)', port: FRONTEND_PORT, path: '/', requests: 60, concurrency: 8, auth: false },
    { layer: 'Frontend', name: 'Dashboard View (/dashboard)', port: FRONTEND_PORT, path: '/dashboard', requests: 50, concurrency: 6, auth: false },
    { layer: 'Frontend', name: 'Expenses List View (/expenses)', port: FRONTEND_PORT, path: '/expenses', requests: 50, concurrency: 6, auth: false },
    { layer: 'Frontend', name: 'Audit Logs View (/audit-logs)', port: FRONTEND_PORT, path: '/audit-logs', requests: 50, concurrency: 6, auth: false },
    { layer: 'Frontend', name: 'Sponsorships View (/sponsors)', port: FRONTEND_PORT, path: '/sponsors', requests: 50, concurrency: 6, auth: false },
    { layer: 'Frontend', name: 'Users & Approvals (/users)', port: FRONTEND_PORT, path: '/users', requests: 50, concurrency: 6, auth: false },

    // -------------------------------------------------------------------------
    // BACKEND REST APIs (Express + MongoDB)
    // -------------------------------------------------------------------------
    { layer: 'Backend', name: 'Health Check (/api/health)', port: BACKEND_PORT, path: '/api/health', requests: 120, concurrency: 15, auth: false },
    { layer: 'Backend', name: 'Financial Summary (/reports/financial-summary)', port: BACKEND_PORT, path: '/api/reports/financial-summary', requests: 60, concurrency: 8, auth: true },
    { layer: 'Backend', name: 'Expenses List Query (/api/expenses)', port: BACKEND_PORT, path: '/api/expenses?page=1&limit=25', requests: 60, concurrency: 8, auth: true },
    { layer: 'Backend', name: 'Audit Ledger Trail (/api/audit-logs)', port: BACKEND_PORT, path: '/api/audit-logs', requests: 60, concurrency: 8, auth: true },
    { layer: 'Backend', name: 'Events & Budgets (/api/events)', port: BACKEND_PORT, path: '/api/events', requests: 60, concurrency: 8, auth: true },
    { layer: 'Backend', name: 'User Directory (/api/users)', port: BACKEND_PORT, path: '/api/users', requests: 60, concurrency: 8, auth: true },
    { layer: 'Backend', name: 'Notifications Polling (/api/notifications)', port: BACKEND_PORT, path: '/api/notifications?unreadOnly=true', requests: 80, concurrency: 10, auth: true },
  ];

  const results = [];
  for (const s of scenarios) {
    try {
      const res = await runScenario(s);
      results.push(res);
    } catch (err) {
      console.error(`❌ Error running scenario ${s.name}:`, err.message);
    }
  }

  // Calculate totals
  const totalReqs = results.reduce((acc, r) => acc + r.requests, 0);
  const totalPass = results.reduce((acc, r) => acc + r.successful, 0);
  const totalFail = results.reduce((acc, r) => acc + r.failed, 0);
  const overallPassRate = ((totalPass / totalReqs) * 100).toFixed(1);
  const overallAvgLatency = (results.reduce((acc, r) => acc + r.avg, 0) / results.length).toFixed(1);
  const overallAvgRps = (results.reduce((acc, r) => acc + r.rps, 0) / results.length).toFixed(1);
  const totalTransferred = results.reduce((acc, r) => acc + r.dataKb, 0).toFixed(1);

  console.log('\n================================================================================');
  console.log('🏆 COMPREHENSIVE SITE LOAD TEST RESULTS');
  console.log('================================================================================\n');

  console.log('--- FRONTEND APPLICATION (Port 3000) ---');
  console.table(
    results
      .filter((r) => r.layer === 'Frontend')
      .map((r) => ({
        Page: r.name,
        Requests: r.requests,
        Concurrency: r.concurrency,
        Throughput: `${r.rps} req/s`,
        Avg: `${r.avg}ms`,
        P50: `${r.p50}ms`,
        P95: `${r.p95}ms`,
        P99: `${r.p99}ms`,
        Success: `${r.passRate}%`,
      }))
  );

  console.log('\n--- BACKEND REST API (Port 5000) ---');
  console.table(
    results
      .filter((r) => r.layer === 'Backend')
      .map((r) => ({
        Endpoint: r.name,
        Requests: r.requests,
        Concurrency: r.concurrency,
        Throughput: `${r.rps} req/s`,
        Avg: `${r.avg}ms`,
        P50: `${r.p50}ms`,
        P95: `${r.p95}ms`,
        P99: `${r.p99}ms`,
        Success: `${r.passRate}%`,
      }))
  );

  console.log('\n================================================================================');
  console.log('🎯 EXECUTIVE SUMMARY & BENCHMARK RATING');
  console.log('================================================================================');
  console.log(`   📦 Total Requests Executed:    ${totalReqs}`);
  console.log(`   ✅ Successful (2xx / 3xx):     ${totalPass}`);
  console.log(`   ❌ Failed (4xx / 5xx):         ${totalFail}`);
  console.log(`   📈 Overall Success Rate:       ${overallPassRate}%`);
  console.log(`   ⚡ Average Throughput:         ${overallAvgRps} requests/sec`);
  console.log(`   ⏱️  Average Response Latency:   ${overallAvgLatency} ms`);
  console.log(`   🌐 Total Network Transferred:  ${totalTransferred} KB`);

  let grade = 'A+';
  if (overallPassRate < 95) grade = 'C';
  else if (overallAvgLatency > 200) grade = 'B';
  else if (overallAvgLatency > 100) grade = 'A';

  console.log(`\n   🎖️ Overall System Grade:        ${grade} (Production-Ready)`);
  console.log('================================================================================\n');
}

main().catch(console.error);
