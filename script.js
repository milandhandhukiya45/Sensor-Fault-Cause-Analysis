// Global variables
let uploadedFile = null;
let isProcessing = false;
let charts = {};
let visualizationData = null;

// Feature importance data
const defaultFeatures = [
    { name: 'aa_000', importance: 0.156, description: 'Air Pressure Sensor A' },
    { name: 'ag_005', importance: 0.134, description: 'Air Flow Sensor G' },
    { name: 'ab_001', importance: 0.128, description: 'Air Pressure Sensor B' },
    { name: 'ac_002', importance: 0.115, description: 'Air Compressor Sensor' },
    { name: 'ad_003', importance: 0.098, description: 'Air Tank Sensor' },
    { name: 'ae_004', importance: 0.089, description: 'Air Filter Sensor' },
    { name: 'af_005', importance: 0.076, description: 'Air Valve Sensor' },
    { name: 'ag_006', importance: 0.065, description: 'Air Regulator Sensor' },
    { name: 'ah_007', importance: 0.054, description: 'Air Moisture Sensor' },
    { name: 'ai_008', importance: 0.043, description: 'Air Temperature Sensor' },
    { name: 'aj_009', importance: 0.032, description: 'Air Quality Sensor' },
    { name: 'ak_010', importance: 0.028, description: 'Air Vibration Sensor' }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
    initializeCharts();
    renderFeatureImportance(defaultFeatures);
});

// File upload functionality
function initializeFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // Drag and drop events
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', handleFileSelect);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
}

async function handleFileUpload(file) {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        uploadedFile = file;
        showFileInfo(file);
        enableActionButtons();
        showStatus('success', `File "${file.name}" uploaded successfully`);
        
        // Upload file to backend and fetch visualization data
        try {
            await uploadFileToBackend(file);
            await fetchVisualizationData();
            updateChartsWithRealData();
        } catch (error) {
            console.error('Error uploading file or fetching data:', error);
            showStatus('warning', 'File uploaded but could not fetch visualization data');
        }
    } else {
        showStatus('error', 'Please select a CSV file');
    }
}

async function uploadFileToBackend(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
    }

    return await response.json();
}

async function fetchVisualizationData() {
    try {
        const response = await fetch('http://localhost:5000/api/visualization-data');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch visualization data');
        }
        
        visualizationData = await response.json();
        return visualizationData;
    } catch (error) {
        console.error('Error fetching visualization data:', error);
        throw error;
    }
}

function updateChartsWithRealData() {
    if (!visualizationData) return;

    // Update class distribution chart
    if (charts.classChart) {
        charts.classChart.destroy();
    }
    initializeClassChart();

    // Update correlation chart
    if (charts.correlationChart) {
        charts.correlationChart.destroy();
    }
    initializeCorrelationChart();

    // Update sensor behavior chart
    if (charts.sensorChart) {
        charts.sensorChart.destroy();
    }
    initializeSensorChart();
}

function showFileInfo(file) {
    const dropZone = document.getElementById('dropZone');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = fileInfo.querySelector('.file-name');
    const fileSize = fileInfo.querySelector('.file-size');

    dropZone.classList.add('hidden');
    fileInfo.classList.remove('hidden');
    fileName.textContent = file.name;
    fileSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
}

function removeFile() {
    uploadedFile = null;
    visualizationData = null;
    const dropZone = document.getElementById('dropZone');
    const fileInfo = document.getElementById('fileInfo');
    const fileInput = document.getElementById('fileInput');

    dropZone.classList.remove('hidden');
    fileInfo.classList.add('hidden');
    fileInput.value = '';
    disableActionButtons();
    showStatus('info', 'File removed. Please upload a new CSV file.');
    
    // Reset charts to default data
    if (charts.classChart) {
        charts.classChart.destroy();
    }
    if (charts.correlationChart) {
        charts.correlationChart.destroy();
    }
    if (charts.sensorChart) {
        charts.sensorChart.destroy();
    }
    initializeCharts();
}

// Action buttons functionality
function enableActionButtons() {
    const buttons = ['detectBtn', 'classifyBtn', 'rootCauseBtn'];
    buttons.forEach(id => {
        document.getElementById(id).disabled = false;
    });
    document.getElementById('actionHint').classList.add('hidden');
}

function disableActionButtons() {
    const buttons = ['detectBtn', 'classifyBtn', 'rootCauseBtn'];
    buttons.forEach(id => {
        document.getElementById(id).disabled = true;
    });
    document.getElementById('actionHint').classList.remove('hidden');
}

function setProcessingState(processing) {
    isProcessing = processing;
    const buttons = ['detectBtn', 'classifyBtn', 'rootCauseBtn'];
    
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (processing) {
            btn.classList.add('processing');
            btn.disabled = true;
        } else {
            btn.classList.remove('processing');
            btn.disabled = !uploadedFile;
        }
    });
}

// Analysis functions
async function detectAnomalies() {
    if (!uploadedFile || isProcessing) return;

    setProcessingState(true);
    showStatus('info', 'Detecting anomalies using Z-Score analysis...');

    try {
        // First upload the file
        const uploadFormData = new FormData();
        uploadFormData.append('file', uploadedFile);

        const uploadResponse = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: uploadFormData,
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Failed to upload file');
        }

        // Then detect anomalies
        const response = await fetch('http://localhost:5000/api/detect-anomalies', {
            method: 'POST',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to detect anomalies');
        }

        const result = await response.json();
        showAnomalyResults(result.data);
        showStatus('success', 'Anomaly detection completed successfully');
        switchTab('results');
    } catch (error) {
        console.error('Error detecting anomalies:', error);
        showStatus('error', `Error: ${error.message}`);
    } finally {
        setProcessingState(false);
    }
}

async function classifyFaults() {
    if (!uploadedFile || isProcessing) return;

    setProcessingState(true);
    showStatus('info', 'Classifying faults using Random Forest...');

    try {
        // First upload the file
        const uploadFormData = new FormData();
        uploadFormData.append('file', uploadedFile);

        const uploadResponse = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: uploadFormData,
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Failed to upload file');
        }

        // Then classify faults
        const response = await fetch('http://localhost:5000/api/classify-faults', {
            method: 'POST',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to classify faults');
        }

        const result = await response.json();
        showClassificationResults(result.data);
        showStatus('success', 'Fault classification completed successfully');
        switchTab('results');
    } catch (error) {
        console.error('Error classifying faults:', error);
        showStatus('error', `Error: ${error.message}`);
    } finally {
        setProcessingState(false);
    }
}

async function identifyRootCause() {
    if (!uploadedFile || isProcessing) return;

    setProcessingState(true);
    showStatus('info', 'Identifying root cause sensors using feature importance...');

    try {
        // First upload the file
        const uploadFormData = new FormData();
        uploadFormData.append('file', uploadedFile);

        const uploadResponse = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: uploadFormData,
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Failed to upload file');
        }

        // Then classify faults (needed for feature importance)
        const classifyResponse = await fetch('http://localhost:5000/api/classify-faults', {
            method: 'POST',
        });

        if (!classifyResponse.ok) {
            const errorData = await classifyResponse.json();
            throw new Error(errorData.error || 'Failed to classify faults');
        }

        // Then get root cause analysis
        const response = await fetch('http://localhost:5000/api/root-cause', {
            method: 'POST',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to identify root cause');
        }

        const result = await response.json();
        renderFeatureImportance(result.data.topSensors, true);
        showStatus('success', 'Root cause analysis completed successfully');
        switchTab('importance');
    } catch (error) {
        console.error('Error identifying root cause:', error);
        showStatus('error', `Error: ${error.message}`);
    } finally {
        setProcessingState(false);
    }
}

// Results display functions
function showAnomalyResults(data) {
    const resultsContent = document.getElementById('resultsContent');
    const noResults = document.getElementById('noResults');

    noResults.classList.add('hidden');
    resultsContent.classList.remove('hidden');

    resultsContent.innerHTML = `
        <div class="card">
            <div class="importance-header">
                <svg class="importance-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <h3>Anomaly Detection Results</h3>
            </div>
            
            <div class="results-grid">
                <div class="result-card blue">
                    <div class="result-info">
                        <p>Total Samples</p>
                        <p>${data.totalSamples.toLocaleString()}</p>
                    </div>
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                </div>
                
                <div class="result-card red">
                    <div class="result-info">
                        <p>Anomalies Found</p>
                        <p>${data.anomalies.toLocaleString()}</p>
                    </div>
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        <path d="M12 9v4"/>
                        <path d="m12 17 .01 0"/>
                    </svg>
                </div>
                
                <div class="result-card orange">
                    <div class="result-info">
                        <p>Anomaly Rate</p>
                        <p>${data.anomalyRate}%</p>
                    </div>
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                    </svg>
                </div>
                
                <div class="result-card yellow">
                    <div class="result-info">
                        <p>Critical Anomalies</p>
                        <p>${data.criticalAnomalies.toLocaleString()}</p>
                    </div>
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        <path d="M12 9v4"/>
                        <path d="m12 17 .01 0"/>
                    </svg>
                </div>
            </div>
            
            <div class="result-breakdown">
                <h4>Anomaly Breakdown</h4>
                <div class="breakdown-item">
                    <span style="color: #dc2626;">Critical Anomalies:</span>
                    <span>${data.criticalAnomalies.toLocaleString()}</span>
                </div>
                <div class="breakdown-item">
                    <span style="color: #ea580c;">Major Anomalies:</span>
                    <span>${data.majorAnomalies.toLocaleString()}</span>
                </div>
                <div class="breakdown-item">
                    <span style="color: #d97706;">Minor Anomalies:</span>
                    <span>${data.minorAnomalies.toLocaleString()}</span>
                </div>
            </div>
        </div>
    `;
}

function showClassificationResults(data) {
    const resultsContent = document.getElementById('resultsContent');
    const noResults = document.getElementById('noResults');

    noResults.classList.add('hidden');
    resultsContent.classList.remove('hidden');

    resultsContent.innerHTML = `
        <div class="card">
            <div class="importance-header">
                <svg class="importance-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <path d="M12 9v4"/>
                    <path d="m12 17 .01 0"/>
                </svg>
                <h3>Fault Classification Results</h3>
            </div>
            
            <div class="results-grid">
                <div class="result-card green">
                    <div class="result-info">
                        <p>Accuracy</p>
                        <p>${data.accuracy}%</p>
                    </div>
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                </div>
                
                <div class="result-card blue">
                    <div class="result-info">
                        <p>Precision</p>
                        <p>${data.precision}%</p>
                    </div>
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                    </svg>
                </div>
                
                <div class="result-card purple">
                    <div class="result-info">
                        <p>Recall</p>
                        <p>${data.recall}%</p>
                    </div>
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                </div>
                
                <div class="result-card indigo">
                    <div class="result-info">
                        <p>F1-Score</p>
                        <p>${data.f1Score}%</p>
                    </div>
                    <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="20" x2="18" y2="10"/>
                        <line x1="12" y1="20" x2="12" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                </div>
            </div>
            
            <div class="result-breakdown">
                <h4>Classification Distribution</h4>
                ${Object.entries(data.classes).map(([className, count]) => `
                    <div class="breakdown-item">
                        <span style="color: ${className === 'Normal' ? '#16a34a' : '#dc2626'};">${className}:</span>
                        <span>${count.toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Feature importance rendering
function renderFeatureImportance(features, showAlert = false) {
    const featureList = document.getElementById('featureList');
    const importanceAlert = document.getElementById('importanceAlert');

    if (showAlert) {
        importanceAlert.classList.remove('hidden');
    }

    featureList.innerHTML = features.map((feature, index) => {
        const importanceLevel = getImportanceLevel(feature.importance);
        return `
            <div class="feature-item">
                <div class="feature-rank">#${index + 1}</div>
                <div class="feature-details">
                    <div class="feature-header">
                        <h4 class="feature-name">${feature.name}</h4>
                        <div class="feature-badges">
                            <span class="importance-badge ${importanceLevel}">${getImportanceLabel(feature.importance)}</span>
                            <span class="importance-value">${(feature.importance * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    <p class="feature-description">${feature.description}</p>
                    <div class="importance-bar">
                        <div class="importance-fill ${importanceLevel}" style="width: ${feature.importance * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getImportanceLevel(importance) {
    if (importance > 0.12) return 'critical';
    if (importance > 0.08) return 'high';
    if (importance > 0.05) return 'medium';
    return 'low';
}

function getImportanceLabel(importance) {
    if (importance > 0.12) return 'Critical';
    if (importance > 0.08) return 'High';
    if (importance > 0.05) return 'Medium';
    return 'Low';
}

// Tab functionality
function switchTab(tabName, event) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Fallback: find the button by tabName
        const btns = document.querySelectorAll('.tab-btn');
        btns.forEach(btn => {
            if (btn.textContent.trim().toLowerCase().includes(tabName)) {
                btn.classList.add('active');
            }
        });
    }
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// Status message functionality
function showStatus(type, message) {
    const statusMessage = document.getElementById('statusMessage');
    const statusText = statusMessage.querySelector('.status-text');
    const statusIcon = statusMessage.querySelector('.status-icon');

    // Remove all type classes
    statusMessage.classList.remove('success', 'error', 'warning', 'info', 'hidden');
    
    // Add the appropriate type class
    statusMessage.classList.add(type);
    statusText.textContent = message;

    // Update icon based on type
    const icons = {
        success: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
        error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
        warning: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="m12 17 .01 0"/>',
        info: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'
    };

    statusIcon.innerHTML = icons[type] || icons.info;

    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 5000);
    }
}

function closeStatus() {
    document.getElementById('statusMessage').classList.add('hidden');
}

// Chart initialization
function initializeCharts() {
    initializeClassChart();
    initializeCorrelationChart();
    initializeSensorChart();
}

function initializeClassChart() {
    const ctx = document.getElementById('classChart').getContext('2d');
    
    // Use real data if available, otherwise use default
    let labels = ['Normal', 'Fault Class 1', 'Fault Class 2', 'Fault Class 3'];
    let data = [52340, 4560, 2100, 1000];
    
    if (visualizationData && visualizationData.classDistribution) {
        labels = Object.keys(visualizationData.classDistribution);
        data = Object.values(visualizationData.classDistribution);
    }
    
    charts.classChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Samples',
                data: data,
                backgroundColor: [
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6',
                    '#06B6D4',
                    '#84CC16'
                ],
                borderColor: [
                    '#059669',
                    '#D97706',
                    '#DC2626',
                    '#7C3AED',
                    '#0891B2',
                    '#65A30D'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initializeCorrelationChart() {
    const ctx = document.getElementById('correlationChart').getContext('2d');
    
    // Use real data if available, otherwise use default
    let labels = ['aa_000', 'ag_005', 'ab_001', 'ac_002', 'ad_003', 'ae_004', 'af_005', 'ag_006'];
    let data = [0.78, 0.65, 0.72, 0.58, 0.45, 0.52, 0.39, 0.33];
    
    if (visualizationData && visualizationData.correlations) {
        const correlationEntries = Object.entries(visualizationData.correlations)
            .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
            .slice(0, 10); // Top 10 correlations
        
        labels = correlationEntries.map(([sensor]) => sensor);
        data = correlationEntries.map(([, corr]) => Math.abs(corr));
    }
    
    charts.correlationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Correlation with Target',
                data: data,
                backgroundColor: '#8B5CF6',
                borderColor: '#7C3AED',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1
                }
            }
        }
    });
}

function initializeSensorChart() {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    
    // Use real data if available, otherwise use default
    let labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    let datasets = [
        {
            label: 'aa_000 (Air Pressure A)',
            data: [8.5, 8.3, 8.1, 7.9, 8.2, 8.6, 9.1, 9.5, 9.8, 10.2, 10.5, 10.8, 11.1, 11.0, 10.7, 10.4, 10.1, 9.8, 9.5, 9.2, 8.9, 8.7, 8.6, 8.5],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
        },
        {
            label: 'ag_005 (Air Flow G)',
            data: [6.2, 6.0, 5.8, 5.6, 6.1, 6.5, 7.0, 7.4, 7.8, 8.2, 8.5, 8.8, 9.1, 9.0, 8.7, 8.4, 8.1, 7.8, 7.5, 7.2, 6.9, 6.7, 6.5, 6.3],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
        },
        {
            label: 'ab_001 (Air Pressure B)',
            data: [7.8, 7.6, 7.4, 7.2, 7.7, 8.1, 8.6, 9.0, 9.3, 9.7, 10.0, 10.3, 10.6, 10.5, 10.2, 9.9, 9.6, 9.3, 9.0, 8.7, 8.4, 8.2, 8.0, 7.9],
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4
        }
    ];
    
    if (visualizationData && visualizationData.timeSeriesData) {
        const timeSeriesEntries = Object.entries(visualizationData.timeSeriesData).slice(0, 5); // Top 5 sensors
        const maxLength = Math.max(...timeSeriesEntries.map(([, values]) => values.length));
        
        labels = Array.from({ length: maxLength }, (_, i) => `Sample ${i + 1}`);
        
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        datasets = timeSeriesEntries.map(([sensor, values], index) => {
            const mean = visualizationData.sensorStats[sensor]?.mean || 0;
            return {
                label: `${sensor} (${mean})`,
                data: values,
                borderColor: colors[index % colors.length],
                backgroundColor: `${colors[index % colors.length]}20`,
                tension: 0.4
            };
        });
    }
    
    charts.sensorChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}