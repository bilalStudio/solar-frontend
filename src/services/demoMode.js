/**
 * Demo Mode — Mock API
 *
 * When the user clicks "Launch Demo" on the login screen, a special token
 * (`demo_token_wattvue_2024`) is saved to localStorage. The axios interceptor
 * in api.js checks for this token on every request — if present, it routes
 * the request HERE instead of hitting the backend.
 *
 * This lets clients demo the entire UI offline with realistic data.
 */

const DEMO_TOKEN = 'demo_token_wattvue_2024';

export const isDemoMode = () => localStorage.getItem('wv_token') === DEMO_TOKEN;
export { DEMO_TOKEN };

// ─── Fake data store ────────────────────────────────────────────────────────

const demoCustomers = [
  {
    id: 1, name: 'Ali Hassan', email: 'ali.hassan@example.com',
    phone: '+92 300 1234567', address: 'DHA Phase 5', city: 'Lahore',
    systemSizeKw: 10.0, installationDate: '2023-03-15',
    status: 'active', notes: 'Premium customer, monthly cleaning subscription.',
    createdAt: '2023-03-10T10:30:00',
  },
  {
    id: 2, name: 'Fatima Khan', email: 'fatima.khan@example.com',
    phone: '+92 301 7654321', address: 'F-7 Markaz', city: 'Islamabad',
    systemSizeKw: 7.5, installationDate: '2023-07-22',
    status: 'active', notes: 'Referred by Ali Hassan.',
    createdAt: '2023-07-18T14:20:00',
  },
  {
    id: 3, name: 'Ahmed Raza', email: 'ahmed.raza@example.com',
    phone: '+92 333 9876543', address: 'Clifton Block 2', city: 'Karachi',
    systemSizeKw: 15.0, installationDate: '2024-01-10',
    status: 'active', notes: 'Large commercial installation.',
    createdAt: '2024-01-05T09:15:00',
  },
  {
    id: 4, name: 'Sara Malik', email: 'sara.malik@example.com',
    phone: '+92 321 5551234', address: 'Bahria Town Phase 3', city: 'Rawalpindi',
    systemSizeKw: 5.0, installationDate: '2024-04-18',
    status: 'pending', notes: 'Awaiting net-metering approval.',
    createdAt: '2024-04-15T11:45:00',
  },
  {
    id: 5, name: 'Bilal Ahmed', email: 'bilal.ahmed@example.com',
    phone: '+92 345 1112222', address: 'Gulberg III', city: 'Lahore',
    systemSizeKw: 8.0, installationDate: '2023-11-05',
    status: 'inactive', notes: 'System currently offline pending inverter replacement.',
    createdAt: '2023-10-30T13:00:00',
  },
];

const demoUploads = [
  { id: 101, customer: demoCustomers[0], originalFilename: 'ali_jan_2024.xlsx', dataType: 'SYSTEM', status: 'SUCCESS', rowsProcessed: 12, uploadedAt: '2024-01-15T10:30:00' },
  { id: 102, customer: demoCustomers[0], originalFilename: 'ali_utility_dec.csv', dataType: 'UTILITY', status: 'SUCCESS', rowsProcessed: 2880, uploadedAt: '2024-01-10T14:20:00' },
  { id: 103, customer: demoCustomers[1], originalFilename: 'fatima_production.xlsx', dataType: 'SYSTEM', status: 'SUCCESS', rowsProcessed: 12, uploadedAt: '2024-02-05T09:15:00' },
  { id: 104, customer: demoCustomers[2], originalFilename: 'ahmed_q4_data.xlsx', dataType: 'SYSTEM', status: 'SUCCESS', rowsProcessed: 12, uploadedAt: '2024-01-22T16:00:00' },
];

const demoReports = [
  { id: 201, customer: demoCustomers[0], reportTitle: 'Performance Report - Ali Hassan', reportType: 'PERFORMANCE', emailStatus: 'SENT', sentToEmail: 'ali.hassan@example.com', generatedAt: '2024-01-16T11:00:00', sentAt: '2024-01-16T11:05:00', filePath: '/demo/ali_performance.pdf', fileSizeBytes: 28640 },
  { id: 202, customer: demoCustomers[0], reportTitle: 'Cleaning Impact - Ali Hassan', reportType: 'CLEANING', emailStatus: 'SENT', sentToEmail: 'ali.hassan@example.com', generatedAt: '2024-01-20T14:30:00', sentAt: '2024-01-20T14:35:00', filePath: '/demo/ali_cleaning.pdf', fileSizeBytes: 22480 },
  { id: 203, customer: demoCustomers[1], reportTitle: 'Performance Report - Fatima Khan', reportType: 'PERFORMANCE', emailStatus: 'PENDING', generatedAt: '2024-02-06T10:15:00', filePath: '/demo/fatima_performance.pdf', fileSizeBytes: 26120 },
  { id: 204, customer: demoCustomers[2], reportTitle: 'Loss Analysis - Ahmed Raza', reportType: 'LOSS', emailStatus: 'SENT', sentToEmail: 'ahmed.raza@example.com', generatedAt: '2024-01-25T13:45:00', sentAt: '2024-01-25T13:50:00', filePath: '/demo/ahmed_loss.pdf', fileSizeBytes: 24300 },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildMonthlyData(systemSizeKw) {
  // Realistic seasonal solar curve for Pakistan
  const seasonality = [0.85, 0.90, 1.00, 1.10, 1.18, 1.15, 1.05, 1.05, 1.08, 1.00, 0.92, 0.82];
  const baselineKwhPerKw = 120;

  return months.map((month, i) => {
    const estimated = systemSizeKw * baselineKwhPerKw * seasonality[i];
    // Random variance between -8% and +5%
    const variancePct = -8 + Math.random() * 13;
    const actual = estimated * (1 + variancePct / 100);
    const varianceKwh = actual - estimated;

    return {
      month,
      actual: Math.round(actual * 100) / 100,
      actualKwh: Math.round(actual * 100) / 100,
      estimated: Math.round(estimated * 100) / 100,
      estimatedKwh: Math.round(estimated * 100) / 100,
      variance: Math.round(varianceKwh * 100) / 100,
      varianceKwh: Math.round(varianceKwh * 100) / 100,
      variancePct: Math.round(variancePct * 100) / 100,
      savings: Math.round(actual * 40 * 100) / 100,
    };
  });
}

const monthlyDataByCustomer = {
  1: buildMonthlyData(10.0),
  2: buildMonthlyData(7.5),
  3: buildMonthlyData(15.0),
  4: buildMonthlyData(5.0),
  5: buildMonthlyData(8.0),
};

// ─── Handler ────────────────────────────────────────────────────────────────

/**
 * Match a request and return a fake response.
 * Returns null if the URL isn't recognized (caller should fall through).
 */
export function handleDemoRequest(config) {
  const url = config.url || '';
  const method = (config.method || 'get').toUpperCase();

  const wrap = (data, message = 'OK') => ({
    data: { success: true, message, data, timestamp: new Date().toISOString() },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });

  const fail = (message, status = 400) => {
    const err = new Error(message);
    err.response = {
      status,
      data: { success: false, message, data: null, timestamp: new Date().toISOString() }
    };
    err.config = config;
    return Promise.reject(err);
  };

  // ─── Auth ────────────────────────────────────────────────────────────
  if (url.includes('/api/auth/ping')) {
    return Promise.resolve(wrap('pong', 'WattVue API (demo mode)'));
  }

  // ─── Dashboard KPIs ──────────────────────────────────────────────────
  if (url.includes('/api/analytics/dashboard-kpis')) {
    return Promise.resolve(wrap({
      totalCustomers: demoCustomers.length,
      activeCustomers: demoCustomers.filter(c => c.status === 'active').length,
      pendingCustomers: demoCustomers.filter(c => c.status === 'pending').length,
      totalUploads: demoUploads.length,
      reportsSent: demoReports.filter(r => r.emailStatus === 'SENT').length,
      reportsPending: demoReports.filter(r => r.emailStatus === 'PENDING').length,
      avgVariancePct: -2.45,
    }, 'Dashboard KPIs'));
  }

  // ─── Customers ────────────────────────────────────────────────────────
  if (url.match(/\/api\/customers\/search/)) {
    const params = new URLSearchParams(url.split('?')[1] || '');
    const q = (params.get('q') || '').toLowerCase();
    const results = demoCustomers.filter(c =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
    return Promise.resolve(wrap(results, 'Search results'));
  }

  if (url.match(/\/api\/customers\/(\d+)$/)) {
    const id = parseInt(url.match(/\/api\/customers\/(\d+)/)[1]);
    if (method === 'GET') {
      const c = demoCustomers.find(x => x.id === id);
      return c ? Promise.resolve(wrap(c, 'Customer')) : fail('Customer not found', 404);
    }
    if (method === 'PUT') {
      return Promise.resolve(wrap({ ...demoCustomers.find(x => x.id === id), ...config.data ? JSON.parse(config.data) : {} }, 'Customer updated (demo)'));
    }
    if (method === 'DELETE') {
      return Promise.resolve(wrap(null, 'Customer deleted (demo)'));
    }
  }

  if (url.match(/\/api\/customers(\?|$)/)) {
    if (method === 'POST') {
      const body = config.data ? JSON.parse(config.data) : {};
      const newCustomer = { id: 9999, ...body, createdAt: new Date().toISOString() };
      return Promise.resolve(wrap(newCustomer, 'Customer created (demo)'));
    }

    let list = demoCustomers;
    const params = new URLSearchParams((url.split('?')[1]) || '');
    const status = params.get('status');
    if (status && status !== 'all') list = list.filter(c => c.status === status);
    return Promise.resolve(wrap(list, 'Customers retrieved'));
  }

  // ─── Uploads ──────────────────────────────────────────────────────────
  if (url.match(/\/api\/uploads\?customerId=/)) {
    const customerId = parseInt(new URL('http://x' + url.replace(/^http:\/\/[^\/]+/, '')).searchParams.get('customerId'));
    const filtered = demoUploads.filter(u => u.customer.id === customerId);
    return Promise.resolve(wrap(filtered, 'Uploads retrieved'));
  }

  if (url.includes('/api/uploads/excel') || url.includes('/api/uploads/utility')) {
    const dataType = url.includes('/utility') ? 'UTILITY' : 'SYSTEM';
    return new Promise(resolve => {
      setTimeout(() => resolve(wrap({
        success: true,
        message: 'File processed successfully',
        rowsProcessed: dataType === 'UTILITY' ? 2880 : 12,
        uploadId: 9999,
        dataType,
      }, 'File uploaded')), 800);
    });
  }

  // ─── Analytics ────────────────────────────────────────────────────────
  if (url.match(/\/api\/analytics\/roi\/(\d+)/)) {
    const customerId = parseInt(url.match(/\/roi\/(\d+)/)[1]);
    const monthlyData = monthlyDataByCustomer[customerId] || buildMonthlyData(10);
    const totalActual = monthlyData.reduce((s, m) => s + m.actual, 0);
    const totalEstimated = monthlyData.reduce((s, m) => s + m.estimated, 0);
    return Promise.resolve(wrap({
      totalActualKwh: Math.round(totalActual * 100) / 100,
      totalEstimatedKwh: Math.round(totalEstimated * 100) / 100,
      totalVarianceKwh: Math.round((totalActual - totalEstimated) * 100) / 100,
      totalVariancePct: Math.round(((totalActual - totalEstimated) / totalEstimated) * 10000) / 100,
      actualSavingsPKR: Math.round(totalActual * 40 * 100) / 100,
      estimatedSavingsPKR: Math.round(totalEstimated * 40 * 100) / 100,
      performancePct: Math.round((totalActual / totalEstimated) * 10000) / 100,
      monthlyData,
      months: monthlyData.length,
    }, 'ROI analysis'));
  }

  if (url.match(/\/api\/analytics\/variance\/(\d+)/)) {
    const customerId = parseInt(url.match(/\/variance\/(\d+)/)[1]);
    const monthlyData = monthlyDataByCustomer[customerId] || buildMonthlyData(10);
    return Promise.resolve(wrap(monthlyData, 'Variance analysis'));
  }

  if (url.match(/\/api\/analytics\/compare\/(\d+)/)) {
    const customerId = parseInt(url.match(/\/compare\/(\d+)/)[1]);
    const monthlyData = monthlyDataByCustomer[customerId] || buildMonthlyData(10);
    const systemTotal = monthlyData.reduce((s, m) => s + m.actual, 0);
    return Promise.resolve(wrap({
      systemProductionKwh: Math.round(systemTotal * 100) / 100,
      utilityExportKwh: Math.round(systemTotal * 0.62 * 100) / 100,
      utilityImportKwh: 1840.50,
      alignmentPct: 94.7,
      exportReadingsCount: 1820,
      totalUtilityReadings: 2880,
      isExporting: true,
      systemMonthlyData: monthlyData,
    }, 'Comparison result'));
  }

  if (url.match(/\/api\/analytics\/utility-validation\/(\d+)/)) {
    return Promise.resolve(wrap({
      totalReadings: 2880,
      exportReadings: 1820,
      exportPercentage: 63.19,
      isExporting: true,
      status: 'CONFIRMED',
      message: 'System is actively exporting power to the grid. 1820 export events detected.',
    }, 'Utility validation'));
  }

  if (url.match(/\/api\/analytics\/utility-chart\/(\d+)/)) {
    // Generate 96 readings for one day (15-min intervals)
    const readings = [];
    const base = new Date('2024-01-15T00:00:00');
    for (let i = 0; i < 96; i++) {
      const ts = new Date(base.getTime() + i * 15 * 60 * 1000);
      const hour = ts.getHours() + ts.getMinutes() / 60;
      // Solar curve: producing 6am-6pm
      let kwh;
      if (hour < 6 || hour > 18) {
        kwh = 0.3 + Math.random() * 0.2; // night consumption
      } else {
        const peak = Math.sin((hour - 6) / 12 * Math.PI);
        kwh = -peak * 3 + (Math.random() - 0.5) * 0.3; // negative = export
      }
      readings.push({
        timestamp: ts.toISOString(),
        kwh: Math.round(kwh * 100) / 100,
        isExport: kwh < 0,
      });
    }
    return Promise.resolve(wrap(readings, 'Utility chart data'));
  }

  if (url.includes('/api/analytics/loss-calculation')) {
    const body = config.data ? JSON.parse(config.data) : {};
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);
    const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
    const customer = demoCustomers.find(c => c.id === body.customerId) || demoCustomers[0];
    const estimated = customer.systemSizeKw * 4 * days;
    const actual = estimated * 0.15; // assume 85% loss
    const loss = estimated - actual;
    const rate = body.electricityRate || 40;

    return Promise.resolve(wrap({
      customerId: customer.id,
      customerName: customer.name,
      startDate: body.startDate,
      endDate: body.endDate,
      estimatedProductionKwh: Math.round(estimated * 100) / 100,
      actualProductionKwh: Math.round(actual * 100) / 100,
      kwhLoss: Math.round(loss * 100) / 100,
      electricityRatePKR: rate,
      estimatedCostImpactPKR: Math.round(loss * rate * 100) / 100,
      performancePct: 15.0,
      customerSummary: `Dear ${customer.name},\n\nDuring the period ${body.startDate} to ${body.endDate}, our analysis shows your solar system underperformed by approximately ${Math.round(loss * 100) / 100} kWh, equivalent to USD ${Math.round(loss * rate * 100) / 100} in lost savings.\n\nWe recommend a follow-up inspection to identify the cause.\n\nRegards,\nWattVue Team`,
    }, 'Loss calculation complete'));
  }

  if (url.includes('/api/analytics/cleaning-analysis')) {
    const body = config.data ? JSON.parse(config.data) : {};
    const window = body.windowDays || 14;
    const preAvg = 18.5;
    const postAvg = 21.2;
    const kwhGain = postAvg - preAvg;
    const improvementPct = (kwhGain / preAvg) * 100;
    const totalGain = kwhGain * window;
    const customer = demoCustomers.find(c => c.id === body.customerId) || demoCustomers[0];

    return Promise.resolve(wrap({
      cleaningEventId: Math.floor(Math.random() * 1000),
      customerId: customer.id,
      customerName: customer.name,
      cleaningDate: body.cleaningDate,
      windowDays: window,
      preAvgKwh: preAvg,
      postAvgKwh: postAvg,
      dailyKwhGain: Math.round(kwhGain * 100) / 100,
      totalKwhGain: Math.round(totalGain * 100) / 100,
      improvementPct: Math.round(improvementPct * 100) / 100,
      estimatedSavingsPKR: Math.round(totalGain * 40 * 100) / 100,
      wasValuable: improvementPct > 2.0,
      customerLetter: `Dear ${customer.name},\n\nFollowing the panel cleaning service on ${body.cleaningDate}, your solar system shows +${Math.round(improvementPct * 100) / 100}% performance change. Total kWh gained: ${Math.round(totalGain * 100) / 100}.\n\nThe cleaning provided clear value and we recommend scheduling the next service within 3-6 months.\n\nRegards,\nWattVue Team`,
    }, 'Cleaning analysis complete'));
  }

  if (url.match(/\/api\/analytics\/cleaning-history\/(\d+)/)) {
    return Promise.resolve(wrap([
      { id: 1, cleaningDate: '2024-01-15', preAvgKwh: 18.5, postAvgKwh: 21.2, kwhGain: 2.7, improvementPct: 14.6, notes: 'Light dust accumulation' },
      { id: 2, cleaningDate: '2023-10-08', preAvgKwh: 17.2, postAvgKwh: 20.8, kwhGain: 3.6, improvementPct: 20.9, notes: 'Heavy monsoon residue' },
      { id: 3, cleaningDate: '2023-07-12', preAvgKwh: 19.0, postAvgKwh: 20.1, kwhGain: 1.1, improvementPct: 5.8, notes: 'Routine maintenance' },
    ], 'Cleaning history'));
  }

  // ─── Reports ─────────────────────────────────────────────────────────
  if (url.match(/\/api\/reports\/all/)) {
    return Promise.resolve(wrap(demoReports, 'All reports'));
  }

  if (url.match(/\/api\/reports\/history\/(\d+)/)) {
    const id = parseInt(url.match(/\/history\/(\d+)/)[1]);
    return Promise.resolve(wrap(demoReports.filter(r => r.customer.id === id), 'Report history'));
  }

  if (url.match(/\/api\/reports\/generate\/(\d+)/) ||
      url.includes('/api/reports/generate-loss') ||
      url.includes('/api/reports/generate-cleaning') ||
      url.match(/\/api\/reports\/generate-utility\/(\d+)/)) {
    const customer = demoCustomers[0];
    return new Promise(resolve => {
      setTimeout(() => resolve(wrap({
        id: Math.floor(Math.random() * 1000) + 1000,
        customer,
        reportTitle: 'Report - ' + customer.name + ' (Demo)',
        reportType: 'PERFORMANCE',
        emailStatus: 'PENDING',
        generatedAt: new Date().toISOString(),
        filePath: '/demo/generated.pdf',
        fileSizeBytes: 27500,
      }, 'Report generated (demo)')), 800);
    });
  }

  if (url.match(/\/api\/reports\/email\/(\d+)/)) {
    return new Promise(resolve => {
      setTimeout(() => resolve(wrap({
        id: parseInt(url.match(/\/email\/(\d+)/)[1]),
        emailStatus: 'SENT',
        sentAt: new Date().toISOString(),
      }, 'Email sent (demo)')), 600);
    });
  }

  if (url.match(/\/api\/reports\/download\/(\d+)/)) {
    // Return a tiny valid PDF as a blob
    const pdfBytes = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A,  // %PDF-1.4
      // Minimal valid PDF body
      ...new TextEncoder().encode('\n%Demo Mode — Backend not running\n%%EOF\n')
    ]);
    return Promise.resolve({
      data: new Blob([pdfBytes], { type: 'application/pdf' }),
      status: 200, statusText: 'OK', headers: {}, config,
    });
  }

  if (url.match(/\/api\/reports\/excel\/(\d+)/)) {
    const blob = new Blob(['Demo mode — backend not running.'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    return Promise.resolve({ data: blob, status: 200, statusText: 'OK', headers: {}, config });
  }

  if (url.match(/\/api\/reports\/(\d+)$/) && method === 'DELETE') {
    return Promise.resolve(wrap(null, 'Report deleted (demo)'));
  }

  // ─── Fall-through: warn but return empty ─────────────────────────────
  console.warn('[Demo Mode] Unhandled request:', method, url);
  return Promise.resolve(wrap(null, 'Demo mode — endpoint not implemented'));
}
