import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useModelStore } from '../../store/modelStore';
import { usePredictionStore } from '../../store/predictionStore';
import { predictBatch } from '../../utils/modelTraining';
import { parseCSV } from '../../utils/dataProcessing';
import type { PredictionInput } from '../../types';

interface BatchPredictionResult {
  input: Record<string, string | number>;
  predictedClass: string | number;
  probability?: number;
}

const BatchPrediction: React.FC = () => {
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { preprocessingOptions } = useDataStore();
  const { modelInstance, metrics } = useModelStore();
  const { setBatchResults } = usePredictionStore();
  const batchResults = (usePredictionStore(state => state.batchResults) || []) as BatchPredictionResult[];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      setBatchFile(file);
    }
  };

  const handlePredict = async () => {
    if (!batchFile || !modelInstance || !metrics) {
      setError('Please upload a file and ensure the model is trained');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const dataset = await parseCSV(batchFile);
      
      // Validate features
      const missingFeatures = preprocessingOptions.features.filter(
        feature => !dataset.data[0] || !(feature in dataset.data[0])
      );
      
      if (missingFeatures.length > 0) {
        throw new Error(`Missing required features: ${missingFeatures.join(', ')}`);
      }
      
      // Prepare inputs
      const inputs: PredictionInput[] = dataset.data.map(row => {
        const input: PredictionInput = {};
        for (const feature of preprocessingOptions.features) {
          input[feature] = row[feature] ?? '';
        }
        return input;
      });
      
      // Make predictions
      const results = await predictBatch(
        modelInstance,
        inputs,
        preprocessingOptions.features,
        metrics.classLabels,
        typeof metrics.classLabels[0] === 'number'
      );
      
      setBatchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during batch prediction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File upload section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Batch Prediction
          </h3>
          <button
            onClick={handlePredict}
            disabled={!batchFile || isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white 
              ${!batchFile || isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors duration-150`}
          >
            {isLoading ? 'Processing...' : 'Predict'}
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload CSV file
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4 file:rounded-md
              file:border-0 file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 
              dark:file:bg-gray-700 dark:file:text-gray-300
              dark:hover:file:bg-gray-600"
          />
          {batchFile && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selected file: {batchFile.name}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results section */}
      {batchResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Prediction Results
          </h3>
          
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-200 dark:border-gray-700 font-medium">
              <div>Input Features</div>
              <div>Predicted Class</div>
              <div>Confidence</div>
            </div>
            
            {batchResults.map(result => (
              <div 
                key={`${Object.entries(result.input).map(([k, v]) => `${k}-${v}`).join('-')}`}
                className="grid grid-cols-3 gap-4 py-2 border-b border-gray-200 dark:border-gray-700"
              >
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {Object.entries(result.input).map(([feature, value]) => (
                    <div key={feature}>{feature}: {String(value)}</div>
                  ))}
                </div>
                <div className="text-sm font-medium">
                  {String(result.predictedClass)}
                </div>
                <div className="text-sm text-gray-500">
                  {result.probability !== undefined && `${(result.probability * 100).toFixed(1)}%`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchPrediction;