import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import Button from '../common/Button';
import Card from '../common/Card';
import Alert from '../common/Alert';
import Tooltip from '../common/Tooltip';
import { Info } from 'lucide-react';
import { DataProcessingStatus, PreprocessingOptions } from '../../types';
import { preprocessData } from '../../utils/dataProcessing';

const PreprocessingForm: React.FC = () => {
  const { 
    dataset, 
    preprocessingOptions, 
    setPreprocessingOptions, 
    setProcessedData,
    setStatus,
    setError
  } = useDataStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Helper to update a single option
  const updateOption = <K extends keyof PreprocessingOptions>(
    key: K,
    value: PreprocessingOptions[K]
  ) => {
    setPreprocessingOptions({ [key]: value });
  };
  
  // Handle preprocessing
  const handlePreprocess = async () => {
    if (!dataset) return;
    
    setIsProcessing(true);
    setStatus(DataProcessingStatus.Loading);
    
    try {
      // Validate
      if (!preprocessingOptions.targetVariable) {
        throw new Error('Please select a target variable');
      }
      
      if (preprocessingOptions.features.length === 0) {
        throw new Error('Please select at least one feature');
      }
      
      // Process data
      const { processedData,  } = preprocessData(
        dataset.data,
        preprocessingOptions
      );
      
      // Update store with processed data
      setProcessedData(processedData);
      setStatus(DataProcessingStatus.Success);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setStatus(DataProcessingStatus.Error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!dataset) {
    return (
      <Alert variant="info">
        Please upload a dataset first.
      </Alert>
    );
  }
  
  return (
    <Card 
      title="Data Preprocessing Options" 
      variant="bordered"
      className="bg-white dark:bg-gray-900 transition-colors duration-150"
    >
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handlePreprocess(); }}>
        {/* Target Variable Selection */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Target Variable
            <Tooltip content="The column containing the class labels you want to predict">
              <Info className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-500" />
            </Tooltip>
          </label>
          <select
            value={preprocessingOptions.targetVariable}
            onChange={(e) => updateOption('targetVariable', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-colors duration-150"
          >
            <option value="">Select target variable</option>
            {dataset.columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
        
        {/* Feature Selection */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Features
            <Tooltip content="The columns to use as input features for the model">
              <Info className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-500" />
            </Tooltip>
          </label>
          <div className="mt-1 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-800">
            {dataset.columns.map((column) => (
              <div key={column} className="flex items-center mb-2 group">
                <input
                  type="checkbox"
                  id={`feature-${column}`}
                  value={column}
                  checked={preprocessingOptions.features.includes(column)}
                  disabled={column === preprocessingOptions.targetVariable}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    updateOption('features', 
                      isChecked
                        ? [...preprocessingOptions.features, column]
                        : preprocessingOptions.features.filter(f => f !== column)
                    );
                  }}
                  className="h-4 w-4 text-primary-600 dark:text-primary-500 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 rounded transition-colors duration-150"
                />
                <label
                  htmlFor={`feature-${column}`}
                  className={`ml-2 block text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-150 ${
                    column === preprocessingOptions.targetVariable
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {column}
                  {column === preprocessingOptions.targetVariable && ' (target)'}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {preprocessingOptions.features.length} of {dataset.columns.length - 1} features selected
          </div>
        </div>
        
        {/* Missing Value Strategy */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Missing Value Strategy
            <Tooltip content="How to handle missing values in the dataset">
              <Info className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-500" />
            </Tooltip>
          </label>
          <select
            value={preprocessingOptions.missingValueStrategy}
            onChange={(e) => updateOption('missingValueStrategy', e.target.value as any)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-colors duration-150"
          >
            <option value="mean">Mean (average of column values)</option>
            <option value="median">Median (middle value)</option>
            <option value="mode">Mode (most frequent value)</option>
            <option value="remove">Remove rows with missing values</option>
            <option value="constant">Replace with constant value</option>
          </select>
          
          {preprocessingOptions.missingValueStrategy === 'constant' && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Replacement Value
              </label>
              <input
                type="number"
                value={preprocessingOptions.constantValue || 0}
                onChange={(e) => updateOption('constantValue', Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-150"
              />
            </div>
          )}
        </div>
        
        {/* Scaling Method */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Feature Scaling
            <Tooltip content="Normalize data to improve model performance">
              <Info className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-500" />
            </Tooltip>
          </label>
          <select
            value={preprocessingOptions.scaling}
            onChange={(e) => updateOption('scaling', e.target.value as any)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-colors duration-150"
          >
            <option value="none">No scaling</option>
            <option value="minmax">Min-Max Scaling (0 to 1)</option>
            <option value="standard">Standardization (mean=0, std=1)</option>
            <option value="robust">Robust Scaling (using quartiles)</option>
          </select>
        </div>
        
        {/* Train-Test Split */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Test Set Size
            <Tooltip content="Percentage of data used for testing">
              <Info className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-500" />
            </Tooltip>
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={preprocessingOptions.trainTestSplit}
              onChange={(e) => updateOption('trainTestSplit', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer dark:accent-primary-500 transition-colors duration-150"
            />
            <span className="ml-2 min-w-[60px] text-sm text-gray-700 dark:text-gray-300">
              {(preprocessingOptions.trainTestSplit * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>10%</span>
            <span>50%</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isProcessing}
            disabled={
              !preprocessingOptions.targetVariable ||
              preprocessingOptions.features.length === 0
            }
          >
            Process Data
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PreprocessingForm;