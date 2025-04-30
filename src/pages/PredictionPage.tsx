import React from 'react';
import { useModelStore } from '../store/modelStore';
import { ModelStatus } from '../types';

import Alert from '../components/common/Alert';
import SinglePrediction from '../components/prediction/SinglePrediction';
import PredictionResult from '../components/prediction/PredictionResult';
import BatchPrediction from '../components/prediction/BatchPrediction';

const PredictionPage: React.FC = () => {
  const { status } = useModelStore();
  
  if (status !== ModelStatus.Trained) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Make Predictions</h2>
        <Alert variant="info">
          No model has been trained yet. Please go to the Model page to train a model first.
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Make Predictions</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SinglePrediction />
          <PredictionResult />
        </div>
      </div>
      
      <div className="pt-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Batch Predictions</h2>
        <BatchPrediction />
      </div>
    </div>
  );
};

export default PredictionPage;