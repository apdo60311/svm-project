import React, { useState } from 'react';
import { useModelStore } from '../../store/modelStore';
import { useDataStore } from '../../store/dataStore';
import { SVMConfig, ModelStatus, DataProcessingStatus } from '../../types';
import { trainSVMModel, calculateMetrics, calculateFeatureImportance } from '../../utils/modelTraining';

import Button from '../common/Button';
import Card from '../common/Card';
import Alert from '../common/Alert';
import Tooltip from '../common/Tooltip';
import { Info, PlayCircle, Sparkles } from 'lucide-react';

const ModelConfigForm: React.FC = () => {
  const [isTraining, setIsTraining] = useState(false);
  
  const { config, setConfig, setStatus, setMetrics, setFeatureImportance, setTrainingDuration, setModelInstance } = useModelStore();
  
  const { preprocessingOptions, processedData, status: dataStatus } = useDataStore();
  
  // Apply preset configurations
  const applyPreset = (preset: 'basic' | 'balanced' | 'accurate' | 'complex') => {
    switch (preset) {
      case 'basic':
        setConfig({
          kernel: 'linear',
          C: 1.0,
          gamma: 'scale',
          degree: 3,
          coef0: 0.0,
          probabilistic: true
        });
        break;
      case 'balanced':
        setConfig({
          kernel: 'rbf',
          C: 1.0,
          gamma: 'scale',
          degree: 3,
          coef0: 0.0,
          probabilistic: true
        });
        break;
      case 'accurate':
        setConfig({
          kernel: 'rbf',
          C: 10.0,
          gamma: 'scale',
          degree: 3,
          coef0: 0.0,
          probabilistic: true
        });
        break;
      case 'complex':
        setConfig({
          kernel: 'polynomial',
          C: 1.0,
          gamma: 'scale',
          degree: 3,
          coef0: 1.0,
          probabilistic: true
        });
        break;
    }
  };
  
  // Helper to update a single config property
  const updateConfig = <K extends keyof SVMConfig>(
    key: K,
    value: SVMConfig[K]
  ) => {
    setConfig({ [key]: value });
  };
  
  // Train the model
  const handleTrainModel = async () => {
    if (!processedData || !processedData.trainingData || !processedData.trainingLabels) {
      return;
    }
    
    setIsTraining(true);
    setStatus(ModelStatus.Training);
    
    try {
      // Train model
      const { model, trainingTime } = trainSVMModel(
        processedData.trainingData,
        processedData.trainingLabels,
        config
      );
      
      // Calculate metrics
      const metrics = calculateMetrics(
        model,
        processedData.testingData!,
        processedData.testingLabels!
      );
      
      // Calculate feature importance (only works well for linear kernel)
      const featureImportance = calculateFeatureImportance(
        model,
        preprocessingOptions.features
      );
      
      // Update store
      setModelInstance(model);
      setMetrics(metrics);
      setFeatureImportance(featureImportance);
      setTrainingDuration(trainingTime);
      setStatus(ModelStatus.Trained);
    } catch (error) {
      setStatus(ModelStatus.Error);
      console.error('Error training model:', error);
    } finally {
      setIsTraining(false);
    }
  };
  
  if (dataStatus !== DataProcessingStatus.Success || !processedData?.trainingData) {
    return (
      <Alert variant="info">
        Please process your dataset before configuring the model.
      </Alert>
    );
  }
  
  return (
    <Card 
      title="SVM Model Configuration" 
      variant="bordered"
      className="bg-white dark:bg-gray-900 transition-colors duration-150"
    >
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleTrainModel(); }}>
        {/* Preset Configurations */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Presets
            <Tooltip content="Predefined configurations optimized for different use cases">
              <Info className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-500" />
            </Tooltip>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { name: 'Basic (Linear)', preset: 'basic' },
              { name: 'Balanced (RBF)', preset: 'balanced' },
              { name: 'Accurate (RBF)', preset: 'accurate' },
              { name: 'Complex (Poly)', preset: 'complex' }
            ].map(({ name, preset }) => (
              <Button
                key={preset}
                type="button"
                variant="outline"
                size="sm"
                icon={<Sparkles className="h-4 w-4" />}
                onClick={() => applyPreset(preset as any)}
                className="group transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/30"
              >
                {name}
              </Button>
            ))}
          </div>
        </div>

        {/* Kernel Type */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kernel Type
            <Tooltip content="Defines how SVM separates the data. Different kernels work better for different data types.">
              <Info className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-500" />
            </Tooltip>
          </label>
          <select
            value={config.kernel}
            onChange={(e) => updateConfig('kernel', e.target.value as SVMConfig['kernel'])}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-colors duration-150"
          >
            <option value="linear">Linear</option>
            <option value="rbf">RBF (Radial Basis Function)</option>
            <option value="polynomial">Polynomial</option>
            <option value="sigmoid">Sigmoid</option>
          </select>
          
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {config.kernel === 'linear' && (
              'Best for linearly separable data. Fast and works well with high-dimensional data.'
            )}
            {config.kernel === 'rbf' && (
              'Versatile kernel that works well with most datasets. Good default choice.'
            )}
            {config.kernel === 'polynomial' && (
              'Good for non-linear boundaries. Degree parameter controls complexity.'
            )}
            {config.kernel === 'sigmoid' && (
              'Similar to neural networks. Can be useful for specific problems.'
            )}
          </div>
        </div>

        {/* Regularization Parameter (C) */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Regularization Parameter (C)
            <Tooltip content="Controls the trade-off between smooth decision boundary and classifying training points correctly. Lower values = more regularization.">
              <Info className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-500" />
            </Tooltip>
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0.1"
              max="100"
              step="0.1"
              value={config.C}
              onChange={(e) => updateConfig('C', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer dark:accent-primary-500 transition-colors duration-150"
            />
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={config.C}
              onChange={(e) => updateConfig('C', Number(e.target.value))}
              className="w-20 px-2 py-1 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md transition-colors duration-150"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0.1 (More regularization)</span>
            <span>100 (Less regularization)</span>
          </div>
        </div>

        {/* Gamma Parameter */}
        <div className={config.kernel === 'linear' ? 'opacity-50' : ''}>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gamma
            <Tooltip content="Defines how far the influence of a single training example reaches. Low values = far reach, high values = close reach.">
              <Info className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-500" />
            </Tooltip>
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <select
                value={typeof config.gamma === 'string' ? config.gamma : 'custom'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'scale' || value === 'auto') {
                    updateConfig('gamma', value);
                  } else {
                    updateConfig('gamma', 0.1);
                  }
                }}
                className="block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-colors duration-150"
                disabled={config.kernel === 'linear'}
              >
                <option value="scale">scale (1/(n_features * X.var()))</option>
                <option value="auto">auto (1/n_features)</option>
                <option value="custom">Custom value</option>
              </select>
            </div>
            
            {typeof config.gamma !== 'string' && (
              <div className="w-24">
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={config.gamma}
                  onChange={(e) => updateConfig('gamma', Number(e.target.value))}
                  className="block w-full px-2 py-2 text-base bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md transition-colors duration-150"
                  disabled={config.kernel === 'linear'}
                />
              </div>
            )}
          </div>
        </div>

        {/* Polynomial Degree */}
        <div className={config.kernel !== 'polynomial' ? 'opacity-50' : ''}>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Polynomial Degree
            <Tooltip content="Degree of the polynomial kernel function. Only applies to polynomial kernel.">
              <Info className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-500" />
            </Tooltip>
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={config.degree}
              onChange={(e) => updateConfig('degree', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer dark:accent-primary-500 transition-colors duration-150"
              disabled={config.kernel !== 'polynomial'}
            />
            <span className="w-8 text-center text-gray-900 dark:text-gray-100">{config.degree}</span>
          </div>
        </div>

        {/* Coefficient (coef0) */}
        <div className={config.kernel !== 'polynomial' && config.kernel !== 'sigmoid' ? 'opacity-50' : ''}>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Coefficient (coef0)
            <Tooltip content="Independent term in kernel function. Only significant for polynomial and sigmoid kernels.">
              <Info className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-500" />
            </Tooltip>
          </label>
          <input
            type="number"
            step="0.1"
            value={config.coef0}
            onChange={(e) => updateConfig('coef0', Number(e.target.value))}
            className="block w-full px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-150"
            disabled={config.kernel !== 'polynomial' && config.kernel !== 'sigmoid'}
          />
        </div>

        {/* Probabilistic Output */}
        <div>
          <div className="flex items-center">
            <input
              id="probabilistic"
              type="checkbox"
              checked={config.probabilistic}
              onChange={(e) => updateConfig('probabilistic', e.target.checked)}
              className="h-4 w-4 text-primary-600 dark:text-primary-500 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 rounded transition-colors duration-150"
            />
            <label htmlFor="probabilistic" className="ml-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Probability Estimates
              <Tooltip content="Allows the model to output probability scores. May increase training time.">
                <Info className="h-4 w-4 ml-1 text-gray-400 dark:text-gray-500" />
              </Tooltip>
            </label>
          </div>
        </div>

        {/* Training data summary */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md transition-colors duration-150">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Training Summary</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Training samples:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">{processedData.trainingData.length}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Testing samples:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">{processedData.testingData?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Features:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">{preprocessingOptions.features.length}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Target:</span>
              <span className="ml-1 text-gray-900 dark:text-gray-100">{preprocessingOptions.targetVariable}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            icon={<PlayCircle className="h-5 w-5" />}
            isLoading={isTraining}
          >
            {isTraining ? 'Training Model...' : 'Train Model'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ModelConfigForm;