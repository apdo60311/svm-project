import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import { createFeatureImportanceChartData } from '../../utils/visualization';
import type { SVMConfig } from '../../types';
import { Info, XCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FeatureImportanceProps {
  featureImportance: Array<{ feature: string; importance: number }>;
  kernel: SVMConfig['kernel'];
}

const FeatureImportance: React.FC<FeatureImportanceProps> = ({
  featureImportance,
  kernel
}) => {
  const sortedFeatures = [...featureImportance].sort((a, b) => b.importance - a.importance);
  const topFeatures = sortedFeatures.slice(0, 3);
  const data = createFeatureImportanceChartData(sortedFeatures);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Feature Importance',
        color: 'rgb(156, 163, 175)', // text-gray-400
        padding: 20
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Importance Score',
          color: 'rgb(156, 163, 175)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(tickValue: number | string) {
            const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
            return `${(value * 100).toFixed(1)}%`;
          }
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        }
      },
      y: {
        title: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card 
        title="Feature Importance Analysis" 
        className="bg-white dark:bg-gray-900 transition-colors duration-150"
      >
        <div className="p-4 space-y-6">
          {/* Explanation section */}
          <motion.div 
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  Feature importance analysis helps identify which input features have the strongest influence on the model's predictions.
                  {kernel === 'linear' ? (
                    " The chart below shows the relative importance of each feature based on the SVM model's coefficients."
                  ) : (
                    " This analysis is only available for linear kernel SVMs."
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {kernel === 'linear' ? (
              <motion.div
                key="chart"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Top features summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {topFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.feature}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + (index * 0.1) }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Top Feature #{index + 1}
                          </div>
                          <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                            {feature.feature}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                            {(feature.importance * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Importance
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <motion.div
                          className="bg-primary-600 dark:bg-primary-500 h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${feature.importance * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Feature importance chart */}
                <div className="relative h-96">
                  <Bar
                    data={data}
                    options={options}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="not-available"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <XCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Feature importance analysis is only available for linear kernel.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Current kernel: <span className="font-medium capitalize">{kernel}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};

export default FeatureImportance;