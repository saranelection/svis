// RTPS Voter Management System - Application Logic

// DOM Elements
const subdivisionSelect = document.getElementById('subdivision');
const blockSelect = document.getElementById('block');
const panchayatSelect = document.getElementById('panchayat');
const searchBtn = document.getElementById('searchBtn');
const excelFileInput = document.getElementById('excelFile');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const pollingStationTable = document.getElementById('pollingStationTable');
const tableBody = pollingStationTable.querySelector('tbody');
const noDataMessage = document.getElementById('noDataMessage');
const assemblyInfo = document.getElementById('assemblyInfo');
const assemblyName = document.getElementById('assemblyName');
const assemblyNo = document.getElementById('assemblyNo');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Populate the subdivision dropdown with initial data
    populateSubdivisions();
    
    // Set up event listeners
    subdivisionSelect.addEventListener('change', handleSubdivisionChange);
    blockSelect.addEventListener('change', handleBlockChange);
    panchayatSelect.addEventListener('change', handlePanchayatChange);
    searchBtn.addEventListener('click', displayPollingStations);
    uploadBtn.addEventListener('click', handleFileUpload);
});

// Populate the subdivision dropdown
function populateSubdivisions() {
    // Clear existing options except the first one
    subdivisionSelect.innerHTML = '<option value="">Select Subdivision</option>';
    
    // Add options for each subdivision
    voterData.subdivisions.forEach(subdivision => {
        const option = document.createElement('option');
        option.value = subdivision.id;
        option.textContent = subdivision.name;
        subdivisionSelect.appendChild(option);
    });
}

// Handle subdivision selection change
function handleSubdivisionChange() {
    // Reset dependent dropdowns
    blockSelect.innerHTML = '<option value="">Select Block</option>';
    panchayatSelect.innerHTML = '<option value="">Select Panchayat</option>';
    
    // Disable dependent controls
    blockSelect.disabled = true;
    panchayatSelect.disabled = true;
    searchBtn.disabled = true;
    
    // Clear table
    clearTable();
    
    const selectedSubdivisionId = subdivisionSelect.value;
    
    if (selectedSubdivisionId) {
        // Find the selected subdivision
        const selectedSubdivision = voterData.subdivisions.find(
            subdivision => subdivision.id === selectedSubdivisionId
        );
        
        if (selectedSubdivision && selectedSubdivision.blocks.length > 0) {
            // Populate blocks dropdown
            selectedSubdivision.blocks.forEach(block => {
                const option = document.createElement('option');
                option.value = block.id;
                option.textContent = block.name;
                blockSelect.appendChild(option);
            });
            
            // Enable block selection
            blockSelect.disabled = false;
        }
    }
}

// Handle block selection change
function handleBlockChange() {
    // Reset panchayat dropdown
    panchayatSelect.innerHTML = '<option value="">Select Panchayat</option>';
    
    // Disable dependent controls
    panchayatSelect.disabled = true;
    searchBtn.disabled = true;
    
    // Clear table
    clearTable();
    
    const selectedSubdivisionId = subdivisionSelect.value;
    const selectedBlockId = blockSelect.value;
    
    if (selectedSubdivisionId && selectedBlockId) {
        // Find the selected subdivision and block
        const selectedSubdivision = voterData.subdivisions.find(
            subdivision => subdivision.id === selectedSubdivisionId
        );
        
        if (selectedSubdivision) {
            const selectedBlock = selectedSubdivision.blocks.find(
                block => block.id === selectedBlockId
            );
            
            if (selectedBlock && selectedBlock.panchayats.length > 0) {
                // Populate panchayats dropdown
                selectedBlock.panchayats.forEach(panchayat => {
                    const option = document.createElement('option');
                    option.value = panchayat.id;
                    option.textContent = panchayat.name;
                    panchayatSelect.appendChild(option);
                });
                
                // Enable panchayat selection
                panchayatSelect.disabled = false;
            }
        }
    }
}

// Handle panchayat selection change
function handlePanchayatChange() {
    // Enable/disable search button based on selection
    searchBtn.disabled = !panchayatSelect.value;
    
    // Clear table
    clearTable();
}

// Display polling stations for the selected panchayat
function displayPollingStations() {
    // Clear existing table data
    clearTable();
    
    const selectedSubdivisionId = subdivisionSelect.value;
    const selectedBlockId = blockSelect.value;
    const selectedPanchayatId = panchayatSelect.value;
    
    if (selectedSubdivisionId && selectedBlockId && selectedPanchayatId) {
        // Find the selected subdivision, block, and panchayat
        const selectedSubdivision = voterData.subdivisions.find(
            subdivision => subdivision.id === selectedSubdivisionId
        );
        
        if (selectedSubdivision) {
            const selectedBlock = selectedSubdivision.blocks.find(
                block => block.id === selectedBlockId
            );
            
            if (selectedBlock) {
                const selectedPanchayat = selectedBlock.panchayats.find(
                    panchayat => panchayat.id === selectedPanchayatId
                );
                
                if (selectedPanchayat && selectedPanchayat.pollingStations.length > 0) {
                    // Display Assembly information if available
                    if (selectedPanchayat.assemblyName && selectedPanchayat.assemblyNo) {
                        assemblyName.textContent = `Assembly: ${selectedPanchayat.assemblyName}`;
                        assemblyNo.textContent = `${selectedPanchayat.assemblyNo}`;
                        assemblyInfo.classList.remove('d-none');
                    } else {
                        assemblyInfo.classList.add('d-none');
                    }
                    
                    // Show the polling stations in the table
                    selectedPanchayat.pollingStations.forEach(station => {
                        const row = document.createElement('tr');
                        
                        row.innerHTML = `
                            <td>${station.number}</td>
                            <td>${station.name}</td>
                            <td>${station.number3 || ''}</td>
                            <td>${station.name3 || ''}</td>
                        `;
                        
                        tableBody.appendChild(row);
                    });
                    
                    // Hide the no data message
                    noDataMessage.classList.add('d-none');
                } else {
                    // Show no data message
                    noDataMessage.textContent = 'No polling stations found for the selected panchayat.';
                    noDataMessage.classList.remove('d-none');
                    assemblyInfo.classList.add('d-none');
                }
            }
        }
    }
}

// Clear the polling stations table
function clearTable() {
    tableBody.innerHTML = '';
    noDataMessage.classList.add('d-none');
    assemblyInfo.classList.add('d-none');
}

// Handle Excel file upload
function handleFileUpload() {
    const file = excelFileInput.files[0];
    
    if (!file) {
        showUploadStatus('Please select an Excel file to upload.', 'status-warning');
        return;
    }
    
    // Check file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        showUploadStatus('Please upload a valid Excel file (.xlsx or .xls).', 'status-error');
        return;
    }
    
    showUploadStatus('Processing file...', 'status-info');
    
    // Read the Excel file
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Process the Excel data
            processExcelData(workbook);
            
        } catch (error) {
            console.error('Error processing Excel file:', error);
            showUploadStatus('Error processing the Excel file. Please check the format.', 'status-error');
        }
    };
    
    reader.onerror = function() {
        showUploadStatus('Error reading the file.', 'status-error');
    };
    
    reader.readAsArrayBuffer(file);
}

// Process the Excel data and update the data.js file
// Process the Excel data and update the data.js file
function processExcelData(workbook) {
    try {
        // Expected sheet names
        const sheetNames = workbook.SheetNames;
        
        if (sheetNames.length === 0) {
            showUploadStatus('The Excel file does not contain any sheets.', 'status-error');
            return;
        }
        
        // Create a new data structure
        const newVoterData = {
            subdivisions: []
        };
        
        // Process the first sheet (assuming it contains all the hierarchical data)
        const worksheet = workbook.Sheets[sheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
            showUploadStatus('The Excel sheet does not contain any data.', 'status-error');
            return;
        }
        
        // Check if the required columns exist
        const firstRow = jsonData[0];
        const requiredColumns = [
            'Assembly No', 'Assembly Name', 
            'Subdivision ID', 'Subdivision Name', 
            'Block ID', 'Block Name', 
            'Panchayat ID', 'Panchayat Name', 
            'Station No', 'Station Name',
            'Station No3', 'Station Name3'
        ];
        
        const missingColumns = [];
        
        for (const column of requiredColumns) {
            if (!(column in firstRow)) {
                missingColumns.push(column);
            }
        }
        
        if (missingColumns.length > 0) {
            showUploadStatus(`Missing required columns: ${missingColumns.join(', ')}`, 'status-error');
            return;
        }
        
        // Process the data and build the hierarchical structure
        jsonData.forEach(row => {
            try {
                // Get subdivision
                let subdivision = newVoterData.subdivisions.find(s => s.id === row['Subdivision ID']);
                
                if (!subdivision) {
                    subdivision = {
                        id: row['Subdivision ID'],
                        name: row['Subdivision Name'],
                        assemblyNo: row['Assembly No'] ? row['Assembly No'].toString() : '',
                        assemblyName: row['Assembly Name'] || '',
                        blocks: []
                    };
                    newVoterData.subdivisions.push(subdivision);
                }
                
                // Get block
                let block = subdivision.blocks.find(b => b.id === row['Block ID']);
                
                if (!block) {
                    block = {
                        id: row['Block ID'],
                        name: row['Block Name'],
                        assemblyNo: row['Assembly No'] ? row['Assembly No'].toString() : '',
                        assemblyName: row['Assembly Name'] || '',
                        panchayats: []
                    };
                    subdivision.blocks.push(block);
                }
                
                // Get panchayat
                let panchayat = block.panchayats.find(p => p.id === row['Panchayat ID']);
                
                if (!panchayat) {
                    panchayat = {
                        id: row['Panchayat ID'],
                        name: row['Panchayat Name'],
                        assemblyNo: row['Assembly No'] ? row['Assembly No'].toString() : '',
                        assemblyName: row['Assembly Name'] || '',
                        pollingStations: []
                    };
                    block.panchayats.push(panchayat);
                }
                
                // Add polling station with the additional fields
                const pollingStation = {
                    id: 'ps_' + panchayat.pollingStations.length + 1,
                    number: row['Station No'] ? row['Station No'].toString() : '',
                    name: row['Station Name'] || '',
                    assemblyNo: row['Assembly No'] ? row['Assembly No'].toString() : '',
                    assemblyName: row['Assembly Name'] || '',
                    number3: row['Station No3'] ? row['Station No3'].toString() : '',
                    name3: row['Station Name3'] || ''
                };
                
                panchayat.pollingStations.push(pollingStation);
            } catch (error) {
                console.error('Error processing row:', row, error);
                // Continue to next row even if one fails
            }
        });
        
        // Update the global voterData object
        Object.assign(voterData, newVoterData);
        
        // Update the UI
        populateSubdivisions();
        clearTable();
        
        // Reset dependent dropdowns
        blockSelect.innerHTML = '<option value="">Select Block</option>';
        panchayatSelect.innerHTML = '<option value="">Select Panchayat</option>';
        blockSelect.disabled = true;
        panchayatSelect.disabled = true;
        searchBtn.disabled = true;
        
        // Generate the data.js file content
        const dataJsContent = generateDataJsContent(newVoterData);
        
        // In a real application, this would save to the server
        // For this demo, we'll show how to download the file
        downloadDataJs(dataJsContent);
        
        showUploadStatus('Data successfully processed and updated!', 'status-success');
        
    } catch (error) {
        console.error('Error processing Excel data:', error);
        showUploadStatus(`Error processing the Excel data: ${error.message}`, 'status-error');
    }
}

// Generate the data.js file content
function generateDataJsContent(data) {
    return `// RTPS Voter Management System Data
// This file was updated on ${new Date().toLocaleString()}

const voterData = ${JSON.stringify(data, null, 2)};

// Export the data for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { voterData };
}
`;
}

// Download the data.js file
function downloadDataJs(content) {
    const blob = new Blob([content], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.js';
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Show upload status message
function showUploadStatus(message, className) {
    uploadStatus.textContent = message;
    uploadStatus.className = '';
    uploadStatus.classList.add(className);
}