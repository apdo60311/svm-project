import React from 'react';
import { Link } from 'react-router-dom';
import { useModelStore } from '../store/modelStore';
import { ModelStatus } from '../types';

import Alert from '../components/common/Alert';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ConfusionMatrix from '../components/results/ConfusionMatrix';
import MetricsChart from '../components/results/MetricsChart';
import FeatureImportance from '../components/results/FeatureImportance';
import Spinner from '../components/common/Spinner';
import { formatPercent, formatTime } from '../utils/formatting';
import { ChevronRight, Download } from 'lucide-react';

const ResultsPage: React.FC = () => {
  const { status, metrics, featureImportance, trainingDuration, config } = useModelStore();
  
  if (status === ModelStatus.Untrained) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Model Results & Insights</h2>
        <Alert variant="info">
          No model has been trained yet. Please go to the Model page to train a model first.
        </Alert>
      </div>
    );
  }
  
  if (status === ModelStatus.Training) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Model Results & Insights</h2>
        <Card variant="bordered">
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Training SVM model...</p>
          </div>
        </Card>
      </div>
    );
  }
  
  if (!metrics) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Model Results & Insights</h2>
        <Alert variant="error">
          Error loading model metrics. Please try training the model again.
        </Alert>
      </div>
    );
  }
  
  // Generate report as JSON
  const generateReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      model: {
        type: 'SVM',
        kernel: config.kernel,
        regularization: config.C,
        gamma: config.gamma,
        degree: config.degree,
        coef0: config.coef0,
      },
      performance: {
        accuracy: metrics.accuracy,
        classMetrics: metrics.classLabels.map((label, i) => ({
          class: label,
          precision: metrics.precision[i],
          recall: metrics.recall[i],
          f1Score: metrics.f1Score[i],
        })),
        confusionMatrix: metrics.confusionMatrix,
      },
      featureImportance: featureImportance,
      trainingDuration,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'svm_model_report.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Model Results & Insights</h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={generateReport}
          icon={<Download className="h-4 w-4" />}
        >
          Export Report
        </Button>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-xs text-gray-500">Accuracy</div>
          <div className="mt-1 text-xl font-semibold text-primary-600">{formatPercent(metrics.accuracy)}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-xs text-gray-500">Training Time</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">{formatTime(trainingDuration || 0)}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-xs text-gray-500">Kernel</div>
          <div className="mt-1 text-xl font-semibold text-gray-900 capitalize">{config.kernel}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-xs text-gray-500">Classes</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">{metrics.classLabels.length}</div>
        </div>
      </div>
      
      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfusionMatrix metrics={metrics} />
        <MetricsChart metrics={metrics} />
      </div>
      
      <div className="mt-6">
        <FeatureImportance 
          featureImportance={featureImportance || []} 
          kernel={config.kernel}
        />
      </div>
      
      <div className="flex justify-end mt-6">
        <Link to="/predict">
          <Button 
            size="md"
            icon={<ChevronRight className="h-4 w-4" />}
            iconPosition="right"
          >
            Make Predictions
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ResultsPage;