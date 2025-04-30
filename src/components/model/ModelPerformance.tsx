import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModelStore } from '../../store/modelStore';
import { ModelStatus } from '../../types';
import { formatPercent, formatTime } from '../../utils/formatting';

import Card from '../common/Card';
import Alert from '../common/Alert';
import Spinner from '../common/Spinner';
import { Clock, Target, Hash, ChevronRight } from 'lucide-react';

const ModelPerformance: React.FC = () => {
  const { status, metrics, trainingDuration } = useModelStore();
  
  if (status === ModelStatus.Untrained) {
    return (
      <Alert variant="info">
        No model has been trained yet. Configure and train a model to see performance metrics.
      </Alert>
    );
  }
  
  if (status === ModelStatus.Training) {
    return (
      <Card title="Model Training" variant="bordered" className="bg-white dark:bg-gray-900">
        <motion.div 
          className="flex flex-col items-center justify-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Spinner size="lg" />
          <motion.p 
            className="mt-4 text-gray-600 dark:text-gray-300"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Training SVM model...
          </motion.p>
        </motion.div>
      </Card>
    );
  }
  
  if (status === ModelStatus.Error) {
    return (
      <Alert variant="error" title="Training Error">
        An error occurred while training the model. Please check your data and model configuration.
      </Alert>
    );
  }
  
  if (!metrics) {
    return (
      <Alert variant="warning">
        Model trained but no metrics available. This might be an internal error.
      </Alert>
    );
  }

  return (
    <Card 
      title="Model Performance Summary" 
      variant="bordered"
      className="bg-white dark:bg-gray-900 transition-colors duration-150"
    >
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Training summary */}
        <motion.div 
          className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Training Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Clock,
                label: 'Training Time',
                value: formatTime(trainingDuration || 0)
              },
              {
                icon: Target,
                label: 'Accuracy',
                value: formatPercent(metrics.accuracy)
              },
              {
                icon: Hash,
                label: 'Number of Classes',
                value: metrics.classLabels.length.toString()
              }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                </div>
                <div className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-100">
                  {item.value}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Class metrics */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Class Metrics</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Class
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Precision
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Recall
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    F1 Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {metrics.classLabels.map((label, index) => (
                    <motion.tr 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (index * 0.05) }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                    >
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {String(label)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatPercent(metrics.precision[index])}
                          </div>
                          <div className="w-full max-w-xs">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <motion.div 
                                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${metrics.precision[index] * 100}%` }}
                                transition={{ duration: 0.5, delay: 0.4 + (index * 0.05) }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatPercent(metrics.recall[index])}
                          </div>
                          <div className="w-full max-w-xs">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <motion.div 
                                className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${metrics.recall[index] * 100}%` }}
                                transition={{ duration: 0.5, delay: 0.5 + (index * 0.05) }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatPercent(metrics.f1Score[index])}
                          </div>
                          <div className="w-full max-w-xs">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <motion.div 
                                className="bg-green-600 dark:bg-green-500 h-2 rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${metrics.f1Score[index] * 100}%` }}
                                transition={{ duration: 0.5, delay: 0.6 + (index * 0.05) }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
        
        {/* Confusion matrix summary */}
        <motion.div 
          className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confusion Matrix Summary
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              The confusion matrix provides a detailed breakdown of predictions versus actual values.
            </p>
            <p className="mt-2">
              Visit the <span className="font-medium text-primary-600 dark:text-primary-400">Results</span> tab 
              to see the full confusion matrix visualization and other model insights.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </Card>
  );
};

export default ModelPerformance;