import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useModelStore } from '../../store/modelStore';
import { usePredictionStore } from '../../store/predictionStore';
import { predict } from '../../utils/modelTraining';
import { PredictionInput } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

import Button from '../common/Button';
import Card from '../common/Card';
import Alert from '../common/Alert';
import Tooltip from '../common/Tooltip';
import { ArrowRight, AlertCircle, Info } from 'lucide-react';

const SinglePrediction: React.FC = () => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { preprocessingOptions } = useDataStore();
  const { modelInstance, metrics, status: modelStatus } = useModelStore();
  const { setPredictionResult, setInputData } = usePredictionStore();
  
  // Check if model is trained
  if (modelStatus !== 'trained' || !modelInstance || !metrics) {
    return (
      <Alert variant="info">
        Please train a model before making predictions.
      </Alert>
    );
  }
  
  // Validate input
  const validateInput = (_feature: string, value: string): string | null => {
    if (!value.trim()) return 'This field is required';
    
    const numberValue = Number(value);
    if (isNaN(numberValue)) return 'Please enter a valid number';
    
    return null;
  };
  
  // Handle input change
  const handleInputChange = (feature: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [feature]: value
    }));
    
    const error = validateInput(feature, value);
    setErrors(prev => ({
      ...prev,
      [feature]: error || ''
    }));
  };
  
  // Handle prediction
  const handlePredict = () => {
    // Validate all inputs
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    
    preprocessingOptions.features.forEach(feature => {
      const error = validateInput(feature, inputValues[feature] || '');
      if (error) {
        newErrors[feature] = error;
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    // Convert string values to numbers
    const input: PredictionInput = {};
    
    for (const feature of preprocessingOptions.features) {
      const value = inputValues[feature] || '';
      input[feature] = Number(value);
    }
    
    try {
      setInputData(input);
      
      const isNumericLabels = typeof metrics.classLabels[0] === 'number';
      const result = predict(
        modelInstance,
        input,
        preprocessingOptions.features,
        metrics.classLabels,
        isNumericLabels
      );
      
      setPredictionResult(result);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card 
      title="Make a Prediction" 
      variant="bordered"
      className="bg-white dark:bg-gray-900 transition-colors duration-150"
    >
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <Info className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <p>Enter values for each feature to get a prediction from the trained model.</p>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {preprocessingOptions.features.map(feature => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <label 
                  htmlFor={`feature-${feature}`} 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {feature}
                  <Tooltip content="Enter a numeric value for this feature">
                    <Info className="inline-block ml-1 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </Tooltip>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id={`feature-${feature}`}
                    type="text"
                    value={inputValues[feature] || ''}
                    onChange={(e) => handleInputChange(feature, e.target.value)}
                    className={`
                      block w-full px-3 py-2 bg-white dark:bg-gray-900
                      border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500
                      text-gray-900 dark:text-gray-100
                      transition-colors duration-150
                      ${errors[feature]
                        ? 'border-error-300 dark:border-error-500 focus:ring-error-500 focus:border-error-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'
                      }
                    `}
                    placeholder="Enter numeric value"
                  />
                  <AnimatePresence>
                    {errors[feature] && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                      >
                        <AlertCircle className="h-5 w-5 text-error-500 dark:text-error-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {errors[feature] && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 text-sm text-error-600 dark:text-error-400"
                    >
                      {errors[feature]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <motion.div 
          className="pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handlePredict}
            isLoading={isLoading}
            disabled={
              isLoading || 
              preprocessingOptions.features.some(f => !inputValues[f]) ||
              Object.keys(errors).some(k => errors[k])
            }
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
          >
            {isLoading ? 'Predicting...' : 'Make Prediction'}
          </Button>
        </motion.div>
      </motion.div>
    </Card>
  );
};

export default SinglePrediction;