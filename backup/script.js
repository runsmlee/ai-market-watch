// ⭐ Apps Script URL - 실제 URL로 변경하세요!
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxxSB7grQucOxewCEFnZIHGVa3NT27bUSwL03nfMbpac9ol5XVoSE-JHlM1Symx9xf/exec';

// Global variables
let allData = [];
let filteredData = [];
let charts = {};
let activeFilters = {
    search: '',
    categories: new Set(),
    locations: new Set(),
    yearFrom: 2010
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        await fetchData();
        setupEventListeners();
        startAutoRefresh();
    } catch (error) {
        console.error('App initialization failed:', error);
        showError('Failed to initialize the application');
    }
}

// Fetch data from Apps Script
async function fetchData() {
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.message || 'Data loading error');
        }
        
        allData = data.data || [];
        filteredData = [...allData];
        
        updateUI();
        setupFilters();
        
    } catch (error) {
        console.error('Data fetch failed:', error);
        showError('Unable to load data. Please check your Apps Script URL configuration.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearchChange, 300));

    // Year range slider
    const yearRange = document.getElementById('yearRange');
    yearRange.addEventListener('input', handleYearChange);

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });

    // Modal close on overlay click
    document.getElementById('companyModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle search input
function handleSearchChange(e) {
    activeFilters.search = e.target.value.toLowerCase();
    applyFilters();
}

// Handle year range change
function handleYearChange(e) {
    const value = parseInt(e.target.value);
    activeFilters.yearFrom = value;
    document.getElementById('yearValue').textContent = value + '+';
    applyFilters();
}

// Handle view toggle
function handleViewChange(e) {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    const view = e.currentTarget.dataset.view;
    const grid = document.getElementById('companiesGrid');
    
    if (view === 'list') {
        grid.style.gridTemplateColumns = '1fr';
    } else {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(380px, 1fr))';
    }
}

// Handle keyboard shortcuts
function handleKeyboard(e) {
    if (e.key === 'Escape') closeModal();
    if (e.key === '/' && !e.target.matches('input')) {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
}

// Setup dynamic filters
function setupFilters() {
    setupCategoryTags();
    setupLocationTags();
}

function setupCategoryTags() {
    const categories = [...new Set(allData.map(company => company['Category']).filter(Boolean))];
    const container = document.getElementById('categoryTags');
    
    container.innerHTML = categories.map(category => `
        <div class="filter-tag" data-category="${category}" onclick="toggleCategoryFilter('${category}')">
            ${category}
        </div>
    `).join('');
}

function setupLocationTags() {
    const locations = [...new Set(allData.map(company => 
        company['Location'] ? company['Location'].split(',')[0].trim() : ''
    ).filter(Boolean))].slice(0, 8); // Show top 8 locations
    
    const container = document.getElementById('locationTags');
    
    container.innerHTML = locations.map(location => `
        <div class="filter-tag" data-location="${location}" onclick="toggleLocationFilter('${location}')">
            ${location}
        </div>
    `).join('');
}

// Filter toggle functions
function toggleCategoryFilter(category) {
    const tag = document.querySelector(`[data-category="${category}"]`);
    
    if (activeFilters.categories.has(category)) {
        activeFilters.categories.delete(category);
        tag.classList.remove('active');
    } else {
        activeFilters.categories.add(category);
        tag.classList.add('active');
    }
    
    applyFilters();
}

function toggleLocationFilter(location) {
    const tag = document.querySelector(`[data-location="${location}"]`);
    
    if (activeFilters.locations.has(location)) {
        activeFilters.locations.delete(location);
        tag.classList.remove('active');
    } else {
        activeFilters.locations.add(location);
        tag.classList.add('active');
    }
    
    applyFilters();
}

// Clear all filters
function clearAllFilters() {
    activeFilters = {
        search: '',
        categories: new Set(),
        locations: new Set(),
        yearFrom: 2010
    };
    
    document.getElementById('searchInput').value = '';
    document.getElementById('yearRange').value = 2010;
    document.getElementById('yearValue').textContent = '2010+';
    
    document.querySelectorAll('.filter-tag.active').forEach(tag => {
        tag.classList.remove('active');
    });
    
    applyFilters();
}

// Apply filters
function applyFilters() {
    filteredData = allData.filter(company => {
        // Search filter
        if (activeFilters.search) {
            const searchText = [
                company['Company Name'],
                company['CEO'],
                company['One-line description'],
                company['Category']
            ].join(' ').toLowerCase();
            
            if (!searchText.includes(activeFilters.search)) return false;
        }

        // Category filter
        if (activeFilters.categories.size > 0) {
            if (!activeFilters.categories.has(company['Category'])) return false;
        }

        // Location filter
        if (activeFilters.locations.size > 0) {
            const companyLocation = company['Location'] ? company['Location'].split(',')[0].trim() : '';
            if (!activeFilters.locations.has(companyLocation)) return false;
        }

        // Year filter
        const foundedYear = parseInt(company['Year Founded']);
        if (foundedYear && foundedYear < activeFilters.yearFrom) return false;

        return true;
    });

    updateUI();
}

// Update UI
function updateUI() {
    updateStats();
    updateCompaniesGrid();
    updateCharts();
}

// Update statistics
function updateStats() {
    const totalCompanies = allData.length;
    const totalCategories = new Set(allData.map(c => c['Category']).filter(Boolean)).size;
    const filteredCount = filteredData.length;
    
    // Calculate total funding (simplified)
    const totalFunding = calculateTotalFunding();

    document.getElementById('totalCompanies').textContent = totalCompanies.toLocaleString();
    document.getElementById('totalCategories').textContent = totalCategories;
    document.getElementById('totalFunding').textContent = formatFunding(totalFunding);
    document.getElementById('filteredCount').textContent = filteredCount.toLocaleString();
}

/**
 * Calculates total funding for the filtered companies.
 * NOTE: This is a simplified calculation. In a real-world scenario, you would need to
 * parse various funding formats (e.g., "$10M", "€5B") to get an accurate number.
 */
function calculateTotalFunding() {
    // Simplified calculation - in reality, you'd parse funding amounts properly
    return filteredData.length * 150000000; // Average estimate
}

// Update companies grid
function updateCompaniesGrid() {
    const grid = document.getElementById('companiesGrid');
    
    if (filteredData.length === 0) {
        grid.innerHTML = `
            <div class="loading">
                <i class="fas fa-search" style="font-size: 2rem; margin-right: 1rem;"></i>
                No companies match your filters
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredData.map(company => createCompanyCard(company)).join('');
}

// Create company card
function createCompanyCard(company) {
    const companyName = company['Company Name'] || 'Unknown';
    const ceo = company['CEO'] || 'Unknown';
    const category = company['Category'] || 'Other';
    const description = company['One-line description'] || 'No description available';
    const funding = company['Total funding raised'] || 'Undisclosed';
    const location = company['Location'] ? company['Location'].split(',')[0] : 'Unknown';
    const year = company['Year Founded'] || 'Unknown';
    const logo = companyName.charAt(0).toUpperCase();

    return `
        <div class="company-card" onclick="openCompanyModal('${escapeHtml(companyName)}')">
            <div class="company-header">
                <div class="company-logo">${logo}</div>
                <div class="company-info">
                    <div class="company-name">${escapeHtml(companyName)}</div>
                    <div class="company-ceo">CEO: ${escapeHtml(ceo)}</div>
                </div>
            </div>
            
            <div class="company-meta">
                <div class="company-category">${escapeHtml(category)}</div>
                <div class="company-year">${year}</div>
            </div>
            
            <div class="company-description">
                ${escapeHtml(description)}
            </div>
            
            <div class="company-footer">
                <div class="company-funding">${escapeHtml(funding)}</div>
                <div class="company-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${escapeHtml(location)}
                </div>
            </div>
        </div>
    `;
}

// Open company modal
function openCompanyModal(companyName) {
    const company = allData.find(c => c['Company Name'] === companyName);
    if (!company) return;

    const modal = document.getElementById('companyModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = createModalContent(company);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Create modal content
function createModalContent(company) {
    const companyName = company['Company Name'] || 'Unknown';
    const ceo = company['CEO'] || 'Unknown';
    const description = company['One-line description'] || 'No description available';
    const category = company['Category'] || 'Other';
    const location = company['Location'] || 'Unknown';
    const year = company['Year Founded'] || 'Unknown';
    const funding = company['Total funding raised'] || 'Undisclosed';
    const teamSize = company['Team size'] || 'Unknown';
    const webpage = company['Webpage'];
    const investors = company['Key investors'] || 'Not disclosed';
    const competitors = company['2-3 main competitors'] || 'Not specified';
    const uvp = company['UVP'] || company['Main value proposition'] || 'Not specified';
    const logo = companyName.charAt(0).toUpperCase();

    const fundingDisplay = funding.includes('$') ? funding.split(' ')[0] : 'N/A';

    return `
        <div class="modal-company-header">
            <div class="modal-company-logo">${logo}</div>
            <div class="modal-company-info">
                <h2>${escapeHtml(companyName)}</h2>
                <div class="modal-company-tagline">${escapeHtml(description)}</div>
                <div class="modal-tags">
                    <div class="modal-tag">${escapeHtml(category)}</div>
                    <div class="modal-tag">${escapeHtml(location.split(',')[0])}</div>
                    <div class="modal-tag">Founded ${year}</div>
                </div>
            </div>
        </div>

        <div class="modal-quick-stats">
            <div class="quick-stat">
                <div class="quick-stat-value">${escapeHtml(ceo)}</div>
                <div class="quick-stat-label">CEO</div>
            </div>
            <div class="quick-stat">
                <div class="quick-stat-value">${escapeHtml(teamSize)}</div>
                <div class="quick-stat-label">Team Size</div>
            </div>
            <div class="quick-stat">
                <div class="quick-stat-value">${year}</div>
                <div class="quick-stat-label">Founded</div>
            </div>
            <div class="quick-stat">
                <div class="quick-stat-value">${escapeHtml(fundingDisplay)}</div>
                <div class="quick-stat-label">Funding</div>
            </div>
        </div>

        <div class="modal-section">
            <h3><i class="fas fa-bullseye"></i> Value Proposition</h3>
            <p>${escapeHtml(uvp)}</p>
        </div>

        <div class="modal-section">
            <h3><i class="fas fa-users"></i> Key Investors</h3>
            <p>${escapeHtml(investors)}</p>
        </div>

        <div class="modal-section">
            <h3><i class="fas fa-chart-line"></i> Competitors</h3>
            <p>${escapeHtml(competitors)}</p>
        </div>

        <div class="modal-section">
            <h3><i class="fas fa-map-marker-alt"></i> Location Details</h3>
            <p>${escapeHtml(location)}</p>
        </div>

        ${webpage && webpage !== 'Not available' ? `
        <div class="modal-links">
            <a href="${escapeHtml(webpage)}" target="_blank" class="modal-link">
                <i class="fas fa-external-link-alt"></i>
                Visit Website
            </a>
        </div>
        ` : ''}
    `;
}

// Close modal
function closeModal() {
    const modal = document.getElementById('companyModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Update charts
function updateCharts() {
    updateCategoryChart();
    updateLocationChart();
    updateFundingChart();
}

function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    const categories = {};
    filteredData.forEach(company => {
        const category = company['Category'] || 'Other';
        categories[category] = (categories[category] || 0) + 1;
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    if (charts.category) charts.category.destroy();

    charts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#ff6b35', '#ff8a65', '#333333', '#444444',
                    '#555555', '#666666', '#777777', '#888888',
                    '#999999', '#aaaaaa', '#bbbbbb', '#cccccc'
                ],
                borderWidth: 0,
                hoverBorderWidth: 3,
                hoverBorderColor: '#ff6b35'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            hover: {
                mode: 'index'
            }
        }
    });
}

function updateLocationChart() {
    const ctx = document.getElementById('locationChart').getContext('2d');
    
    const locations = {};
    filteredData.forEach(company => {
        const location = company['Location'] ? company['Location'].split(',')[0].trim() : 'Unknown';
        locations[location] = (locations[location] || 0) + 1;
    });

    const sortedLocations = Object.entries(locations)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6);

    if (charts.location) charts.location.destroy();

    charts.location = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedLocations.map(([location]) => location),
            datasets: [{
                data: sortedLocations.map(([,count]) => count),
                backgroundColor: 'rgba(255, 107, 53, 0.8)',
                borderColor: 'rgba(255, 107, 53, 1)',
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: 'rgba(255, 138, 101, 0.9)',
                hoverBorderColor: 'rgba(255, 138, 101, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#666666'
                    },
                    grid: {
                        color: '#333333'
                    }
                },
                x: {
                    ticks: {
                        color: '#666666'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function updateFundingChart() {
    const ctx = document.getElementById('fundingChart').getContext('2d');
    
    // Group by founding year
    const yearData = {};
    filteredData.forEach(company => {
        const year = company['Year Founded'];
        if (year && year >= 2015) {
            yearData[year] = (yearData[year] || 0) + 1;
        }
    });

    const sortedYears = Object.entries(yearData).sort(([a], [b]) => a - b);

    if (charts.funding) charts.funding.destroy();

    charts.funding = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedYears.map(([year]) => year),
            datasets: [{
                label: 'Companies Founded',
                data: sortedYears.map(([,count]) => count),
                borderColor: 'rgba(255, 107, 53, 1)',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(255, 107, 53, 1)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: 'rgba(255, 138, 101, 1)',
                pointHoverBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#666666'
                    },
                    grid: {
                        color: '#333333'
                    }
                },
                x: {
                    ticks: {
                        color: '#666666'
                    },
                    grid: {
                        color: '#333333'
                    }
                }
            }
        }
    });
}

// Utility functions
function formatFunding(amount) {
    if (amount >= 1000000000) {
        return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K`;
    }
    return `${amount.toLocaleString()}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    const grid = document.getElementById('companiesGrid');
    grid.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <h3>Error</h3>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

// Auto-refresh data
function startAutoRefresh() {
    setInterval(fetchData, 60000); // Refresh every minute
}

// Initialize demo data if needed
function initializeDemoData() {
    // This would only be used if APPS_SCRIPT_URL is not configured
    if (APPS_SCRIPT_URL.includes('AKfycbxxxSB7grQucOxewCEFnZIHGVa3NT27bUSwL03nfMbpac9ol5XVoSE-JHlM1Symx9xf')) {
        allData = [
            {
                'Company Name': 'OpenAI',
                'CEO': 'Sam Altman',
                'Category': 'Artificial Intelligence',
                'Location': 'San Francisco, California, USA',
                'Year Founded': '2015',
                'Total funding raised': 'Over $14 billion',
                'Webpage': 'https://openai.com/',
                'One-line description': 'An AI research and deployment company focused on ensuring artificial general intelligence benefits all of humanity.',
                'Team size': '~1000 employees',
                'Key investors': 'Microsoft, Thrive Capital, Khosla Ventures',
                'UVP': 'Leading the development of safe and beneficial AGI',
                '2-3 main competitors': 'Google DeepMind, Anthropic, Meta AI'
            },
            // Add more demo data as needed
        ];
        filteredData = [...allData];
        updateUI();
        setupFilters();
    }
}

// Call demo data initialization if needed
setTimeout(() => {
    if (allData.length === 0) {
        initializeDemoData();
    }
}, 2000);