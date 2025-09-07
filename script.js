// ========================================
// Config (from config.js) + safe fallbacks
// ========================================
const BASE_URL =
  (window.APP_CONFIG && window.APP_CONFIG.NASA_NEO_BASE_URL) ||
  'https://api.nasa.gov/neo/rest/v1';

const EXO_PROXY_BASE =
  (window.APP_CONFIG && window.APP_CONFIG.EXO_PROXY_BASE) ||
  '/api/exo';

const MY_API_KEY =
  (window.APP_CONFIG && window.APP_CONFIG.NASA_API_KEY) ||
  'DEMO_KEY';

// ========================
// Tab handling + utilities
// ========================
function showTab(tabName, ev) {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => tab.classList.remove('active'));

  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => button.classList.remove('active'));

  document.getElementById(tabName).classList.add('active');
  (ev?.target || window.event?.target)?.classList.add('active');

  clearResults();
}

function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('results').classList.remove('show');
}
function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}
function showResults() {
  document.getElementById('results').classList.add('show');
}
function clearResults() {
  document.getElementById('results').classList.remove('show');
  document.getElementById('results').innerHTML = '';
  clearJplDetails();
}

function clearJplDetails() {
  const jplDiv = document.getElementById('jpl-details');
  jplDiv.classList.remove('show');
  jplDiv.innerHTML = '';
}

function showJplDetails() {
  document.getElementById('jpl-details').classList.add('show');
}
function getApiKey() {
  return MY_API_KEY && MY_API_KEY !== 'DEMO_KEY' ? MY_API_KEY : 'DEMO_KEY';
}
function showError(message) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `<div class="error-message">${message}</div>`;
  showResults();
}
function showInfo(message) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `<div class="info-message">${message}</div>`;
  showResults();
}
function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // fall back if not a full date
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
function formatDistance(distance) {
  const km = parseFloat(distance.kilometers);
  if (km > 1_000_000) return `${(km / 1_000_000).toFixed(2)} million km`;
  if (km > 1_000) return `${(km / 1_000).toFixed(2)} thousand km`;
  return `${km.toFixed(2)} km`;
}
function formatVelocity(velocity) {
  const kmh = parseFloat(velocity.kilometers_per_hour);
  return `${kmh.toFixed(2)} km/h`;
}
function formatDiameter(diameter) {
  const min = diameter.estimated_diameter_min;
  const max = diameter.estimated_diameter_max;
  return `${min.toFixed(2)} - ${max.toFixed(2)} km`;
}

// ==========================================
// NEOs (Asteroids) — Search / Lookup / Browse
// ==========================================
async function searchAsteroids() {
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const apiKey = getApiKey();

  if (!startDate) {
    showError('Please select a start date');
    return;
  }

  let actualEndDate = endDate;
  if (!endDate) {
    const start = new Date(startDate);
    start.setDate(start.getDate() + 7);
    actualEndDate = start.toISOString().split('T')[0];
  }

  const start = new Date(startDate);
  const end = new Date(actualEndDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 7) {
    showError('Date range cannot exceed 7 days');
    return;
  }

  showLoading();

  try {
    const url = `/api/neo?path=feed&start_date=${startDate}&end_date=${actualEndDate}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    displayFeedResults(data);
  } catch (error) {
    console.error('Error fetching asteroid data:', error);
    showError('Failed to fetch asteroid data. Please check your API key and try again.');
  } finally {
    hideLoading();
  }
}

function displayFeedResults(data) {
  const resultsDiv = document.getElementById('results');
  const asteroidCount = data.element_count;

  let html = `
    <div class="results-header">
      <h3>Found ${asteroidCount} asteroids</h3>
    </div>
  `;

  if (asteroidCount === 0) {
    html += '<div class="info-message">No asteroids found for the selected date range.</div>';
  } else {
    html += '<div class="asteroid-grid">';
    Object.keys(data.near_earth_objects).forEach(date => {
      const asteroids = data.near_earth_objects[date];
      asteroids.forEach(asteroid => {
        const isHazardous = asteroid.is_potentially_hazardous_asteroid;
        const cardClass = isHazardous ? 'asteroid-card hazardous' : 'asteroid-card';
        const closeApproach = asteroid.close_approach_data[0];
        html += `
          <div class="${cardClass}">
            ${isHazardous ? '<div class="hazard-badge">⚠️ Potentially Hazardous</div>' : ''}
            <div class="asteroid-name">${asteroid.name}</div>
            <div class="asteroid-info"><strong>ID:</strong> ${asteroid.id}</div>
            <div class="asteroid-info"><strong>Diameter:</strong> ${formatDiameter(asteroid.estimated_diameter.kilometers)}</div>
            <div class="asteroid-info"><strong>Close Approach:</strong> ${formatDate(closeApproach.close_approach_date)}</div>
            <div class="asteroid-info"><strong>Distance:</strong> ${formatDistance(closeApproach.miss_distance)}</div>
            <div class="asteroid-info"><strong>Velocity:</strong> ${formatVelocity(closeApproach.relative_velocity)}</div>
            <div class="asteroid-info"><strong>Orbiting Body:</strong> ${closeApproach.orbiting_body}</div>
          </div>
        `;
      });
    });
    html += '</div>';
  }

  resultsDiv.innerHTML = html;
  showResults();
}

async function lookupAsteroid() {
  const asteroidId = document.getElementById('asteroid-id').value.trim();
  const apiKey = getApiKey();

  if (!asteroidId) {
    showError('Please enter an asteroid ID');
    return;
  }

  showLoading();

  try {
    const url = `/api/neo?path=neo/${encodeURIComponent(asteroidId)}`;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) throw new Error('Asteroid not found. Please check the ID and try again.');
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const asteroid = await response.json();
    displayLookupResult(asteroid);
  } catch (error) {
    console.error('Error fetching asteroid:', error);
    showError(error.message || 'Failed to fetch asteroid data. Please check the ID and try again.');
  } finally {
    hideLoading();
  }
}

function displayLookupResult(asteroid) {
  const resultsDiv = document.getElementById('results');
  const isHazardous = asteroid.is_potentially_hazardous_asteroid;

  let html = `
    <div class="results-header">
      <h3>Asteroid Details</h3>
    </div>
    <div class="asteroid-grid">
      <div class="${isHazardous ? 'asteroid-card hazardous' : 'asteroid-card'}">
        ${isHazardous ? '<div class="hazard-badge">⚠️ Potentially Hazardous</div>' : ''}
        <div class="asteroid-name">${asteroid.name}</div>
        <div class="asteroid-info"><strong>ID:</strong> ${asteroid.id}</div>
        <div class="asteroid-info"><strong>JPL URL:</strong> <a href="${asteroid.nasa_jpl_url}" target="_blank" rel="noopener">View on NASA JPL</a></div>
        <div class="asteroid-info"><strong>Absolute Magnitude:</strong> ${asteroid.absolute_magnitude_h}</div>
        <div class="asteroid-info"><strong>Diameter (km):</strong> ${formatDiameter(asteroid.estimated_diameter.kilometers)}</div>
        <div class="asteroid-info"><strong>Diameter (m):</strong> ${formatDiameter(asteroid.estimated_diameter.meters)}</div>
        <div class="asteroid-info"><strong>Diameter (mi):</strong> ${formatDiameter(asteroid.estimated_diameter.miles)}</div>
        <div class="asteroid-info"><strong>Diameter (ft):</strong> ${formatDiameter(asteroid.estimated_diameter.feet)}</div>
        <button class="jpl-button" onclick="loadJplDetails('${asteroid.id}')">🔬 Get JPL Database Details</button>
      </div>
    </div>
  `;

  if (asteroid.close_approach_data && asteroid.close_approach_data.length > 0) {
    html += `
      <div class="results-header" style="margin-top: 30px;">
        <h3>Close Approach Data (${asteroid.close_approach_data.length} approaches)</h3>
      </div>
      <div class="asteroid-grid">
    `;
    asteroid.close_approach_data.slice(0, 10).forEach((approach, index) => {
      html += `
        <div class="asteroid-card">
          <div class="asteroid-name">Approach #${index + 1}</div>
          <div class="asteroid-info"><strong>Date:</strong> ${formatDate(approach.close_approach_date)}</div>
          <div class="asteroid-info"><strong>Distance:</strong> ${formatDistance(approach.miss_distance)}</div>
          <div class="asteroid-info"><strong>Velocity:</strong> ${formatVelocity(approach.relative_velocity)}</div>
          <div class="asteroid-info"><strong>Orbiting Body:</strong> ${approach.orbiting_body}</div>
        </div>
      `;
    });
    html += '</div>';
    if (asteroid.close_approach_data.length > 10) {
      html += `<div class="info-message">Showing first 10 of ${asteroid.close_approach_data.length} close approaches</div>`;
    }
  }

  resultsDiv.innerHTML = html;
  showResults();
}

async function browseAsteroids() {
  const apiKey = getApiKey();
  showLoading();
  try {
    const url = `/api/neo?path=neo/browse`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    displayBrowseResults(data);
  } catch (error) {
    console.error('Error browsing asteroids:', error);
    showError('Failed to browse asteroid data. Please check your API key and try again.');
  } finally {
    hideLoading();
  }
}

function displayBrowseResults(data) {
  const resultsDiv = document.getElementById('results');
  const asteroids = data.near_earth_objects;

  let html = `
    <div class="results-header">
      <h3>Browse Asteroid Dataset</h3>
      <p>Showing ${asteroids.length} of ${data.page.total_elements} total asteroids (Page ${data.page.number + 1} of ${data.page.total_pages})</p>
    </div>
  `;

  if (asteroids.length === 0) {
    html += '<div class="info-message">No asteroids found.</div>';
  } else {
    html += '<div class="asteroid-grid">';
    asteroids.forEach(asteroid => {
      const isHazardous = asteroid.is_potentially_hazardous_asteroid;
      const cardClass = isHazardous ? 'asteroid-card hazardous' : 'asteroid-card';
      html += `
        <div class="${cardClass}">
          ${isHazardous ? '<div class="hazard-badge">⚠️ Potentially Hazardous</div>' : ''}
          <div class="asteroid-name">${asteroid.name}</div>
          <div class="asteroid-info"><strong>ID:</strong> ${asteroid.id}</div>
          <div class="asteroid-info"><strong>Absolute Magnitude:</strong> ${asteroid.absolute_magnitude_h}</div>
          <div class="asteroid-info"><strong>Diameter:</strong> ${formatDiameter(asteroid.estimated_diameter.kilometers)}</div>
          <div class="asteroid-info"><strong>JPL URL:</strong> <a href="${asteroid.nasa_jpl_url}" target="_blank" rel="noopener">View Details</a></div>
        </div>
      `;
    });
    html += '</div>';
  }

  resultsDiv.innerHTML = html;
  showResults();
}

// ===================================
// Exoplanets (Nearby planetary systems)
// ===================================
function buildExoplanetQuery(maxParsec = 20, minPlanets = 1, limit = 200) {
  // sy_dist in parsecs; sy_pnum = number of planets in the system; hostname = star; pl_name = planet
  // Order by distance asc, then host name
  const q = `
    SELECT pl_name, hostname, sy_pnum, sy_snum, sy_dist, disc_year, disc_method
    FROM pscomppars
    WHERE sy_dist IS NOT NULL
      AND sy_dist <= ${Number(maxParsec)}
      AND sy_pnum >= ${Number(minPlanets)}
    ORDER BY sy_dist ASC, hostname ASC
    LIMIT ${Number(limit)}
  `;
  return q.replace(/\s+/g, ' ').trim();
}

async function searchExoplanets() {
  clearResults();
  showLoading();

  const maxParsecInput = document.getElementById('max-distance');
  const minPlanetsInput = document.getElementById('min-planets');

  const maxParsec = Number(maxParsecInput?.value || 20);   // default 20 pc (~65 ly)
  const minPlanets = Number(minPlanetsInput?.value || 1);  // default >=1 planet

  try {
    // Hit your proxy to avoid CORS
    const url = `${EXO_PROXY_BASE}?max_pc=${encodeURIComponent(maxParsec)}&min_p=${encodeURIComponent(minPlanets)}&limit=200`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Proxy error: ${res.status}`);

    const data = await res.json(); // array of rows
    displayExoplanetResults(data, maxParsec, minPlanets);
  } catch (err) {
    console.error('Exoplanet fetch error:', err);
    showError('Failed to fetch exoplanetary systems (proxy).');
  } finally {
    hideLoading();
  }
}

function displayExoplanetResults(rows, maxParsec, minPlanets) {
  const resultsDiv = document.getElementById('results');

  // Group planets by system (hostname)
  const systems = new Map();
  for (const r of rows) {
    const host = r.hostname || 'Unknown Host';
    if (!systems.has(host)) {
      systems.set(host, {
        hostname: host,
        sy_pnum: r.sy_pnum,
        sy_snum: r.sy_snum,
        sy_dist: r.sy_dist,
        planets: []
      });
    }
    systems.get(host).planets.push({
      pl_name: r.pl_name,
      disc_year: r.disc_year,
      disc_method: r.disc_method
    });
  }

  const systemList = Array.from(systems.values());
  let html = `
    <div class="results-header">
      <h3>Nearby Exoplanetary Systems</h3>
      <p>Within ${maxParsec} parsecs (~${(maxParsec * 3.26156).toFixed(1)} light-years), at least ${minPlanets} planet(s)</p>
      <p>Found ${systemList.length} system(s)</p>
    </div>
  `;

  if (systemList.length === 0) {
    html += `<div class="info-message">No systems found for the given filters.</div>`;
  } else {
    html += '<div class="asteroid-grid">'; // reuse same grid styles
    systemList.forEach(sys => {
      const distPc = typeof sys.sy_dist === 'number' ? sys.sy_dist : Number(sys.sy_dist);
      const ly = isNaN(distPc) ? '—' : (distPc * 3.26156).toFixed(1);
      const planetsHtml = sys.planets.map(p => `
        <div class="asteroid-info">
          <strong>Planet:</strong> ${p.pl_name}
          ${p.disc_year ? ` | <strong>Year:</strong> ${p.disc_year}` : ''}
          ${p.disc_method ? ` | <strong>Method:</strong> ${p.disc_method}` : ''}
        </div>
      `).join('');

      html += `
        <div class="asteroid-card">
          <div class="asteroid-name">${sys.hostname}</div>
          <div class="asteroid-info"><strong>Distance:</strong> ${distPc?.toFixed ? distPc.toFixed(2) : distPc} pc (~${ly} ly)</div>
          <div class="asteroid-info"><strong>Stars in System:</strong> ${sys.sy_snum ?? '—'}</div>
          <div class="asteroid-info"><strong>Known Planets:</strong> ${sys.sy_pnum ?? sys.planets.length}</div>
          ${planetsHtml}
          <div class="asteroid-info">
            <a href="https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(sys.hostname)}" target="_blank" rel="noopener">Overview on NASA Exoplanet Archive</a>
          </div>
        </div>
      `;
    });
    html += '</div>';
  }

  resultsDiv.innerHTML = html;
  showResults();
}

async function loadJplDetails(spkId) {
  // spkId is the NEO SPK-ID you already use in Lookup
  const box = document.getElementById('jpl-details');
  box.innerHTML = '<div class="info-message">Fetching JPL details…</div>';
  showJplDetails();

  try {
    const res = await fetch(`/api/sbdb?spk=${encodeURIComponent(spkId)}`);
    const text = await res.text();
    if (!res.ok) {
      console.error('SBDB non-OK:', res.status, text);
      throw new Error('SBDB error: ' + res.status);
    }
    const data = JSON.parse(text);
    renderJplDetails(data);
  } catch (err) {
    console.error('SBDB fetch error:', err);
    box.innerHTML = '<div class="error-message">Failed to fetch JPL details.</div>';
  }
}

function renderJplDetails(sbdb) {
  const box = document.getElementById('jpl-details');
  // safe getters
  const obj = sbdb?.object || {};
  const orbit = sbdb?.orbit || {};
  const cls = orbit?.class || {};
  const phys = sbdb?.phys_par || {}; // physical parameters table (when phys-par=true)

  // pick some useful fields
  const fullname = obj.fullname || obj.des || '—';
  const neo = obj.neo ? 'Yes' : 'No';
  const pha = obj.pha ? 'Yes' : 'No';
  const orbitClass = cls?.name ? `${cls.name} (${cls.code || ''})` : '—';
  const moid = orbit?.moid || orbit?.moid_ld ? `${orbit.moid} au` : '—';
  const a = orbit?.a ? `${orbit.a} au` : '—';        // semi-major axis
  const e = orbit?.e ?? '—';                         // eccentricity
  const i = orbit?.i ? `${orbit.i}°` : '—';         // inclination
  const per = orbit?.per ? `${orbit.per} d` : '—';  // orbital period (days)
  const epoch = orbit?.epoch ? `${orbit.epoch}` : '—';

  // phys params (if provided)
  const diameter = phys?.diameter ? `${phys.diameter} km` : '—';
  const albedo = phys?.albedo ?? '—';
  const rot = phys?.rot_per ? `${phys.rot_per} h` : '—';

  box.innerHTML = `
    <div class="results-header" style="margin-top:20px;">
      <h3>JPL Small-Body Database Details</h3>
    </div>
    <div class="asteroid-grid">
      <div class="asteroid-card">
        <div class="asteroid-name">${fullname}</div>
        <div class="asteroid-info"><strong>Near-Earth Object:</strong> ${neo}</div>
        <div class="asteroid-info"><strong>Potentially Hazardous:</strong> ${pha}</div>
        <div class="asteroid-info"><strong>Orbit Class:</strong> ${orbitClass}</div>
        <div class="asteroid-info"><strong>MOID:</strong> ${moid}</div>
        <div class="asteroid-info"><strong>Semi-major axis (a):</strong> ${a}</div>
        <div class="asteroid-info"><strong>Eccentricity (e):</strong> ${e}</div>
        <div class="asteroid-info"><strong>Inclination (i):</strong> ${i}</div>
        <div class="asteroid-info"><strong>Orbital period:</strong> ${per}</div>
        <div class="asteroid-info"><strong>Epoch:</strong> ${epoch}</div>
      </div>

      <div class="asteroid-card">
        <div class="asteroid-name">Physical Parameters</div>
        <div class="asteroid-info"><strong>Diameter:</strong> ${diameter}</div>
        <div class="asteroid-info"><strong>Albedo:</strong> ${albedo}</div>
        <div class="asteroid-info"><strong>Rotation Period:</strong> ${rot}</div>
      </div>
    </div>
  `;
}


// =====================
// On-load defaults
// =====================
document.addEventListener('DOMContentLoaded', function () {
  const today = new Date().toISOString().split('T')[0];
  const startInput = document.getElementById('start-date');
  const endInput = document.getElementById('end-date');
  if (startInput) startInput.value = today;
  if (endInput) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    endInput.value = nextWeek.toISOString().split('T')[0];
  }
});
