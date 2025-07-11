import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Download } from 'lucide-react';
import Papa from 'papaparse';
import { AnalysisData, SensorData } from '../types/analysis';

interface DataUploadProps {
  onDataProcessed: (data: AnalysisData) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const DataUpload: React.FC<DataUploadProps> = ({ onDataProcessed, isProcessing, setIsProcessing }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const processData = useCallback((rawData: SensorData[]) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        // Convert class labels
        const processedData = rawData.map(row => ({
          ...row,
          class: row.class === 'pos' ? 1 : 0
        }));

        // Calculate class distribution
        const classDistribution = processedData.reduce((acc, row) => {
          const classLabel = row.class === 1 ? 'Faulty' : 'Normal';
          acc[classLabel] = (acc[classLabel] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        // Get numeric columns (excluding class)
        const numericColumns = Object.keys(rawData[0]).filter(col => 
          col !== 'class' && !isNaN(Number(rawData[0][col]))
        );

        // Calculate correlations with class (simplified)
        const correlations = numericColumns.map(col => {
          const values = processedData.map(row => Number(row[col]) || 0);
          const classValues = processedData.map(row => Number(row.class));
          
          // Simple correlation calculation
          const n = values.length;
          const sumX = values.reduce((a, b) => a + b, 0);
          const sumY = classValues.reduce((a, b) => a + b, 0);
          const sumXY = values.reduce((sum, x, i) => sum + x * classValues[i], 0);
          const sumX2 = values.reduce((sum, x) => sum + x * x, 0);
          const sumY2 = classValues.reduce((sum, y) => sum + y * y, 0);
          
          const correlation = (n * sumXY - sumX * sumY) / 
            Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
          
          return { feature: col, correlation: Math.abs(correlation) || 0 };
        });

        const topFeatures = correlations
          .sort((a, b) => b.correlation - a.correlation)
          .slice(0, 10)
          .map(item => item.feature);

        // Generate mock feature importances
        const featureImportances = topFeatures.reduce((acc, feature, index) => {
          acc[feature] = Math.max(0.1, 0.8 - index * 0.08);
          return acc;
        }, {} as { [key: string]: number });

        // Generate mock predictions and metrics
        const predictions = {
          actual: processedData.slice(0, 100).map(row => Number(row.class)),
          predicted: processedData.slice(0, 100).map(() => Math.random() > 0.8 ? 1 : 0),
          probabilities: processedData.slice(0, 100).map(() => Math.random())
        };

        const analysisData: AnalysisData = {
          rawData,
          processedData,
          classDistribution,
          topFeatures,
          correlationMatrix: [], // Simplified for demo
          featureImportances,
          anomalies: processedData.filter(row => row.class === 1).slice(0, 10),
          modelMetrics: {
            accuracy: 0.92,
            precision: 0.85,
            recall: 0.78,
            f1Score: 0.81,
            rocAuc: 0.89
          },
          confusionMatrix: [[850, 45], [32, 73]],
          predictions
        };

        onDataProcessed(analysisData);
        setUploadStatus('success');
      } catch (error) {
        setErrorMessage('Error processing data. Please check file format.');
        setUploadStatus('error');
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  }, [onDataProcessed, setIsProcessing]);

  const handleFileUpload = useCallback((uploadedFile: File) => {
    setFile(uploadedFile);
    setUploadStatus('idle');
    setErrorMessage('');

    Papa.parse(uploadedFile, {
      complete: (results) => {
        if (results.errors.length > 0) {
          console.log('CSV parsing errors:', results.errors);
          const criticalErrors = results.errors.filter(error => 
            error.type === 'Delimiter' || error.type === 'Quotes'
          );
          if (criticalErrors.length > 0) {
            setErrorMessage(`Error parsing CSV file: ${criticalErrors[0].message}`);
            setUploadStatus('error');
            return;
          }
        }

        if (!results.data || results.data.length === 0) {
          setErrorMessage('No data found in CSV file');
          setUploadStatus('error');
          return;
        }

        // Filter out empty rows
        const data = (results.data as SensorData[]).filter(row => {
          return Object.values(row).some(value => value !== null && value !== undefined && value !== '');
        });
        
        if (data.length === 0) {
          setErrorMessage('No valid data rows found in CSV file');
          setUploadStatus('error');
          return;
        }

        // Check if 'class' column exists
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          
          // Look for various possible class column names in APS dataset
          const possibleClassColumns = [
            'class', 'target', 'label', 'failure', 'fault', 'status',
            // Check for columns that might contain pos/neg values
            ...headers.filter(header => {
              const sampleValues = data.slice(0, 10).map(row => row[header]).filter(val => val !== null && val !== undefined);
              return sampleValues.some(val => 
                typeof val === 'string' && (val.toLowerCase() === 'pos' || val.toLowerCase() === 'neg')
              );
            })
          ];
          
          const classColumn = headers.find(header => 
            possibleClassColumns.some(possible => 
              header.toLowerCase().includes(possible.toLowerCase())
            )
          );
          
          if (!classColumn) {
            // If no obvious class column, check if any column has pos/neg values
            let foundClassColumn = null;
            for (const header of headers) {
              const values = data.slice(0, 100).map(row => row[header]).filter(val => val !== null && val !== undefined);
              const hasClassValues = values.some(val => 
                (typeof val === 'string' && ['pos', 'neg'].includes(val.toLowerCase())) ||
                (typeof val === 'number' && [0, 1].includes(val)) ||
                val === 0 || val === 1
              );
              if (hasClassValues) {
                foundClassColumn = header;
                break;
              }
            }
            
            if (!foundClassColumn) {
              // Try to find the last column as it's often the target
              const lastColumn = headers[headers.length - 1];
              const lastColumnValues = data.slice(0, 10).map(row => row[lastColumn]).filter(val => val !== null && val !== undefined);
              
              if (lastColumnValues.length > 0) {
                console.log('Using last column as class:', lastColumn, 'Sample values:', lastColumnValues);
                foundClassColumn = lastColumn;
              } else {
                setErrorMessage(`Could not identify target column. Please ensure your CSV has a column with "pos"/"neg" or "0"/"1" values. Found columns: ${headers.slice(0, 10).join(', ')}${headers.length > 10 ? '...' : ''}`);
                setUploadStatus('error');
                return;
              }
            }
            
            // Use the found column
            data.forEach(row => {
              row.class = row[foundClassColumn];
              if (foundClassColumn !== 'class') {
                delete row[foundClassColumn];
              }
            });
          } else {
            // Normalize the class column name to 'class'
            if (classColumn !== 'class') {
              data.forEach(row => {
                row.class = row[classColumn];
                delete row[classColumn];
              });
            }
          }
          
          // Check if class column has valid values and normalize them
          const classValues = data.map(row => row.class).filter(val => val !== null && val !== undefined);
          const uniqueValues = [...new Set(classValues)];
          
          console.log('Class column unique values:', uniqueValues);
          
          // Normalize class values to pos/neg format
          const hasValidValues = uniqueValues.some(val => 
            ['pos', 'neg', '1', '0', 1, 0, 'positive', 'negative', 'true', 'false'].includes(
              typeof val === 'string' ? val.toLowerCase() : val
            )
          );
          
          if (!hasValidValues) {
            // If no obvious class values, assume binary classification with most common being 'neg'
            console.log('No obvious class values found, attempting binary classification');
            const valueCounts = uniqueValues.reduce((acc, val) => {
              acc[val] = (acc[val] || 0) + classValues.filter(v => v === val).length;
              return acc;
            }, {} as any);
            
            const sortedValues = Object.entries(valueCounts).sort((a: any, b: any) => b[1] - a[1]);
            
            if (sortedValues.length >= 2) {
              // Map most common to 'neg' and second most common to 'pos'
              const [mostCommon, secondMost] = sortedValues;
              data.forEach(row => {
                if (row.class === mostCommon[0]) row.class = 'neg';
                else if (row.class === secondMost[0]) row.class = 'pos';
              });
              console.log(`Mapped ${mostCommon[0]} -> neg, ${secondMost[0]} -> pos`);
            } else {
              setErrorMessage(`Unable to identify binary classification in target column. Found values: ${uniqueValues.slice(0, 10).join(', ')}`);
              setUploadStatus('error');
              return;
            }
          } else {
            // Normalize known values
            data.forEach(row => {
              const val = row.class;
              if (typeof val === 'string') {
                const lower = val.toLowerCase();
                if (['1', 'positive', 'true', 'pos'].includes(lower)) {
                  row.class = 'pos';
                } else if (['0', 'negative', 'false', 'neg'].includes(lower)) {
                  row.class = 'neg';
                }
              } else if (typeof val === 'number') {
                row.class = val === 1 ? 'pos' : 'neg';
              }
            });
          }
        }

        processData(data);
      },
      header: true,
      skipEmptyLines: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      transform: (value, field) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          // Handle 'na' values as null
          if (trimmed.toLowerCase() === 'na' || trimmed === '') {
            return null;
          }
          return trimmed;
        }
        return value;
      },
      dynamicTyping: false, // Keep as strings initially for better error handling
      fastMode: false, // Use slower but more robust parsing
      delimiter: ',', // Explicitly set delimiter
      newline: '', // Auto-detect line endings
      quoteChar: '"',
      escapeChar: '"',
      comments: false,
      step: undefined,
      encoding: '',
      worker: false
    });
  }, [processData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      handleFileUpload(csvFile);
    } else {
      setErrorMessage('Please upload a CSV file');
      setUploadStatus('error');
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  }, [handleFileUpload]);

  const downloadSampleData = () => {
    const link = document.createElement('a');
    link.href = 'https://drive.google.com/file/d/1KU_nOSLodN3aNuFoeeu0ZSyy3j3-rUjR/view';
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Sensor Data</h2>
          <p className="text-lg text-gray-600">
            Upload your Scania truck sensor data CSV file to begin fault prediction analysis
          </p>
        </div>

        {/* Sample Data Link */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Need sample data?</h3>
              <p className="text-sm text-blue-700">Download the sample dataset to test the application</p>
            </div>
            <button
              onClick={downloadSampleData}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Sample</span>
            </button>
          </div>
        </div>

        {/* File Upload Area */}
        <div
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
            ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          
          <div className="flex flex-col items-center space-y-4">
            {isProcessing ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Processing Data...</p>
                  <p className="text-sm text-gray-600">Analyzing sensor readings and preparing for fault prediction</p>
                </div>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Data Uploaded Successfully!</p>
                  <p className="text-sm text-gray-600">File: {file?.name}</p>
                </div>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="flex flex-col items-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Upload Error</p>
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Try Again
                </label>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Drop your CSV file here</p>
                  <p className="text-sm text-gray-600">or click to browse</p>
                </div>
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
              </div>
            )}
          </div>
        </div>

        {/* File Requirements */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">File Requirements:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• CSV format with headers</li>
            <li>• Must contain 'class' column with 'pos' (faulty) or 'neg' (normal) values</li>
            <li>• Sensor readings should be numeric values</li>
            <li>• Missing values will be handled automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;