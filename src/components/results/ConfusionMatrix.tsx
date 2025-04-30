import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import type { ModelMetrics } from '../../types';
import { Info } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ConfusionMatrixProps {
  metrics: ModelMetrics;
}

const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ metrics }) => {
  // Calculate matrix statistics
  const matrixStats = useMemo(() => {
    const flatMatrix = metrics.confusionMatrix.flat();
    const total = flatMatrix.reduce((sum, val) => sum + val, 0);
    const correctPredictions = metrics.confusionMatrix.reduce(
      (sum, row, i) => sum + row[i], 0
    );
    const accuracy = correctPredictions / total;
    
    return {
      total,
      correctPredictions,
      accuracy,
      misclassifications: total - correctPredictions
    };
  }, [metrics.confusionMatrix]);

  // Transform confusion matrix data for visualization
  const chartData = {
    labels: metrics.classLabels,
    datasets: metrics.confusionMatrix.map((row, i) => ({
      label: `Actual: ${metrics.classLabels[i]}`,
      data: row,
      backgroundColor: 'rgba(59, 130, 246, 0.5)', // blue-500
      borderColor: 'rgb(37, 99, 235)', // blue-600
      borderWidth: 1,
      barPercentage: 0.8,
      categoryPercentage: 0.9
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)', // text-gray-400
          padding: 10
        }
      },
      title: {
        display: true,
        text: 'Confusion Matrix',
        color: 'rgb(156, 163, 175)', // text-gray-400
        padding: 20
      }
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Predicted Class',
          color: 'rgb(156, 163, 175)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Actual Class',
          color: 'rgb(156, 163, 175)'
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
        title="Confusion Matrix" 
        className="bg-white dark:bg-gray-900 transition-colors duration-150"
      >
        {/* Rest of the component remains the same */}
        <div className="p-4 space-y-6">
          {/* Matrix explanation */}
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
                  The confusion matrix shows the relationship between predicted and actual classes.
                  Darker cells indicate higher numbers of predictions.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Diagonal cells (top-left to bottom-right) show correct predictions</li>
                  <li>Off-diagonal cells show misclassifications</li>
                  <li>Rows represent actual classes</li>
                  <li>Columns represent predicted classes</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Matrix visualization */}
          <div className="relative h-96">
            <Bar
              data={chartData}
              options={options}
            />
          </div>

          {/* Matrix statistics */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {[
              {
                label: 'Total Predictions',
                value: matrixStats.total.toString(),
                color: 'text-blue-600 dark:text-blue-400'
              },
              {
                label: 'Correct Predictions',
                value: matrixStats.correctPredictions.toString(),
                color: 'text-green-600 dark:text-green-400'
              },
              {
                label: 'Misclassifications',
                value: matrixStats.misclassifications.toString(),
                color: 'text-red-600 dark:text-red-400'
              },
              {
                label: 'Overall Accuracy',
                value: `${(matrixStats.accuracy * 100).toFixed(1)}%`,
                color: 'text-purple-600 dark:text-purple-400'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + (index * 0.1) }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
                <div className={`text-lg font-semibold mt-1 ${stat.color}`}>
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ConfusionMatrix;