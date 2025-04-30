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
  ChartOptions,
} from 'chart.js';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import type { ModelMetrics } from '../../types';
import { Info } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MetricsChartProps {
  metrics: ModelMetrics;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ metrics }) => {
  const data = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
    datasets: [{
      label: 'Model Performance Metrics',
      data: [
        metrics.accuracy,
        metrics.precision,
        metrics.recall,
        metrics.f1Score
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.5)',  // blue-500
        'rgba(16, 185, 129, 0.5)',  // green-500
        'rgba(249, 115, 22, 0.5)',  // orange-500
        'rgba(139, 92, 246, 0.5)',  // purple-500
      ],
      borderColor: [
        'rgb(37, 99, 235)',       // blue-600
        'rgb(5, 150, 105)',       // green-600
        'rgb(234, 88, 12)',       // orange-600
        'rgb(124, 58, 237)',      // purple-600
      ],
      borderWidth: 1
    }]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: (value) => `${(Number(value) * 100).toFixed(0)}%`,
          color: 'rgb(156, 163, 175)'  // gray-400
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'  // gray-600 with opacity
        },
        title: {
          display: true,
          text: 'Score',
          color: 'rgb(156, 163, 175)'
        }
      },
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Score: ${(context.parsed.y * 100).toFixed(1)}%`;
          }
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        title="Model Performance Metrics" 
        className="bg-white dark:bg-gray-900 transition-colors duration-150"
      >
        <div className="p-4 space-y-6">
          {/* Metrics explanation */}
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
                  Key performance metrics for evaluating the model:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><span className="font-medium">Accuracy:</span> Overall correct predictions</li>
                  <li><span className="font-medium">Precision:</span> Correct positive predictions among all positive predictions</li>
                  <li><span className="font-medium">Recall:</span> Correct positive predictions among all actual positives</li>
                  <li><span className="font-medium">F1 Score:</span> Harmonic mean of precision and recall</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Chart */}
          <div className="relative h-64">
            <Bar data={data} options={options} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MetricsChart;