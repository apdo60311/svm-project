import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataPoint, DataSet, PreprocessingOptions } from '../types';

/**
 * Parse CSV file content to a structured dataset
 */
export const parseCSV = (file: File): Promise<DataSet> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const dataset: DataSet = {
          data: results.data as DataPoint[],
          columns: results.meta.fields || [],
          filename: file.name,
          size: file.size,
          uploadedAt: new Date(),
        };
        resolve(dataset);
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
};

/**
 * Parse Excel file content to a structured dataset
 */
export const parseExcel = async (file: File): Promise<DataSet> => {
  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = wb.SheetNames[0];
    const worksheet = wb.Sheets[firstSheetName];
    
    // Convert to JSON with headers
    const data = XLSX.utils.sheet_to_json(worksheet) as DataPoint[];
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    
    return {
      data,
      columns,
      filename: file.name,
      size: file.size,
      uploadedAt: new Date(),
    };
  } catch (error) {
    throw new Error(`Excel parsing error: ${(error as Error).message}`);
  }
};

/**
 * Handle missing values in dataset based on strategy
 */
export const handleMissingValues = (
  data: DataPoint[],
  features: string[],
  strategy: PreprocessingOptions['missingValueStrategy'],
  constantValue?: number
): DataPoint[] => {
  // Helper to check if value is missing
  const isMissing = (value: any): boolean => 
    value === null || value === undefined || value === '' || Number.isNaN(value);
  
  // Create a deep copy of the data
  const processedData = JSON.parse(JSON.stringify(data)) as DataPoint[];
  
  // For each feature, handle missing values according to strategy
  features.forEach(feature => {
    // Skip if feature doesn't exist
    if (!data[0]?.hasOwnProperty(feature)) return;
    
    // If strategy is 'remove', filter out rows with missing values
    if (strategy === 'remove') {
      return processedData.filter(row => !isMissing(row[feature]));
    }
    
    // For other strategies, calculate replacement value if needed
    let replacementValue: number | null = null;
    
    if (strategy === 'constant' && constantValue !== undefined) {
      replacementValue = constantValue;
    } else {
      // Get all non-missing values for this feature
      const validValues = data
        .map(row => row[feature])
        .filter(val => !isMissing(val) && typeof val === 'number') as number[];
      
      if (validValues.length === 0) return; // No valid values to calculate from
      
      if (strategy === 'mean') {
        replacementValue = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
      } else if (strategy === 'median') {
        const sorted = [...validValues].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        replacementValue = sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      } else if (strategy === 'mode') {
        // Find the most frequent value
        const frequency: {[key: number]: number} = {};
        let maxFreq = 0;
        let mode = validValues[0];
        
        validValues.forEach(val => {
          frequency[val] = (frequency[val] || 0) + 1;
          if (frequency[val] > maxFreq) {
            maxFreq = frequency[val];
            mode = val;
          }
        });
        
        replacementValue = mode;
      }
    }
    
    // Replace missing values with calculated replacement
    if (replacementValue !== null) {
      processedData.forEach(row => {
        if (isMissing(row[feature])) {
          row[feature] = replacementValue;
        }
      });
    }
  });
  
  return processedData;
};

/**
 * Scale features in the dataset
 */
export const scaleFeatures = (
  data: DataPoint[],
  features: string[],
  method: PreprocessingOptions['scaling']
): { scaledData: DataPoint[], scaleParams: Record<string, { min?: number, max?: number, mean?: number, std?: number }> } => {
  if (method === 'none') {
    return { scaledData: data, scaleParams: {} };
  }
  
  const scaleParams: Record<string, any> = {};
  const scaledData = JSON.parse(JSON.stringify(data)) as DataPoint[];
  
  features.forEach(feature => {
    // Skip if feature doesn't exist or isn't numeric
    if (!data[0]?.hasOwnProperty(feature) || typeof data[0][feature] !== 'number') return;
    
    // Extract numeric values for this feature
    const values = data.map(row => row[feature] as number);
    
    if (method === 'minmax') {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      
      scaleParams[feature] = { min, max };
      
      if (range !== 0) {
        scaledData.forEach(row => {
          row[feature] = ((row[feature] as number) - min) / range;
        });
      }
    } 
    else if (method === 'standard') {
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      // Calculate standard deviation
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      
      scaleParams[feature] = { mean, std };
      
      if (std !== 0) {
        scaledData.forEach(row => {
          row[feature] = ((row[feature] as number) - mean) / std;
        });
      }
    }
    else if (method === 'robust') {
      // Sort values for percentile calculation
      const sortedValues = [...values].sort((a, b) => a - b);
      const q1Index = Math.floor(sortedValues.length * 0.25);
      const q3Index = Math.floor(sortedValues.length * 0.75);
      
      const q1 = sortedValues[q1Index];
      const q3 = sortedValues[q3Index];
      const iqr = q3 - q1;
      
      scaleParams[feature] = { median: sortedValues[Math.floor(sortedValues.length / 2)], iqr, q1, q3 };
      
      if (iqr !== 0) {
        scaledData.forEach(row => {
          row[feature] = ((row[feature] as number) - scaleParams[feature].median) / iqr;
        });
      }
    }
  });
  
  return { scaledData, scaleParams };
};

/**
 * Split data into training and testing sets
 */
export const trainTestSplit = (
  data: DataPoint[],
  targetVariable: string,
  splitRatio: number
): { 
  trainingData: DataPoint[], 
  testingData: DataPoint[],
  trainingLabels: any[],
  testingLabels: any[]
} => {
  // Shuffle the data
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  
  // Calculate split index
  const splitIndex = Math.floor(shuffled.length * (1 - splitRatio));
  
  // Split data
  const trainingData = shuffled.slice(0, splitIndex);
  const testingData = shuffled.slice(splitIndex);
  
  // Extract labels
  const trainingLabels = trainingData.map(row => row[targetVariable]);
  const testingLabels = testingData.map(row => row[targetVariable]);
  
  // Remove target variable from features
  const trainingFeaturesOnly = trainingData.map(row => {
    const { [targetVariable]: _, ...features } = row;
    return features;
  });
  
  const testingFeaturesOnly = testingData.map(row => {
    const { [targetVariable]: _, ...features } = row;
    return features;
  });
  
  return {
    trainingData: trainingFeaturesOnly,
    testingData: testingFeaturesOnly,
    trainingLabels,
    testingLabels
  };
};

/**
 * Apply all preprocessing steps to a dataset
 */
export const preprocessData = (
  data: DataPoint[],
  options: PreprocessingOptions
): { 
  processedData: {
    trainingData: any[],
    testingData: any[],
    trainingLabels: any[],
    testingLabels: any[]
  },
  scaleParams: Record<string, any>
} => {
  // 1. Handle missing values
  const dataWithoutMissing = handleMissingValues(
    data,
    [...options.features, options.targetVariable],
    options.missingValueStrategy,
    options.constantValue
  );
  
  // 2. Scale features
  const { scaledData, scaleParams } = scaleFeatures(
    dataWithoutMissing,
    options.features,
    options.scaling
  );
  
  // 3. Split data
  const split = trainTestSplit(
    scaledData,
    options.targetVariable,
    options.trainTestSplit
  );
  
  return {
    processedData: split,
    scaleParams
  };
};