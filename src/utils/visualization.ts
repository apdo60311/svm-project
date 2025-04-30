import { ChartData, ChartOptions, ScatterDataPoint, Chart } from 'chart.js';
import { ModelMetrics, FeatureImportance } from '../types';

interface ConfusionMatrixDataPoint extends ScatterDataPoint {
  v: number;
}

/**
 * Create confusion matrix chart data
 */
export const createConfusionMatrixChartData = (
  metrics: ModelMetrics
): ChartData<'scatter'> => {
  const { confusionMatrix, classLabels } = metrics;

  return {
    labels: classLabels.map(String),
    datasets: [{
      type: 'scatter',
      data: confusionMatrix.flat().map((value, index) => ({
        x: index % confusionMatrix.length,
        y: Math.floor(index / confusionMatrix.length),
        v: value
      })) as ConfusionMatrixDataPoint[],
      backgroundColor: (context: { raw: ConfusionMatrixDataPoint; dataIndex: number }) => {
        const value = context.raw.v;

        // Calculate intensity based on value
        const maxValue = Math.max(...confusionMatrix.flat());
        const intensity = maxValue > 0 ? value / maxValue : 0;

        // Diagonal (true positives) use success color, others use a shade of blue
        const x = context.raw.x;
        const y = context.raw.y;

        return x === y
          ? `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`
          : `rgba(59, 130, 246, ${0.1 + intensity * 0.5})`;
      }
    }]
  };
};

/**
 * Create confusion matrix chart options
 */
export const confusionMatrixOptions: ChartOptions<'scatter'> = {
  aspectRatio: 1,
  scales: {
    x: {
      title: {
        display: true,
        text: 'Predicted Class',
        font: {
          weight: 'bold'
        }
      },
      ticks: {
        stepSize: 1
      }
    },
    y: {
      title: {
        display: true,
        text: 'True Class',
        font: {
          weight: 'bold'
        }
      },
      ticks: {
        stepSize: 1,
        reverse: true
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        title: () => '',
        label: (context) => {
          const dataPoint = context.raw as ConfusionMatrixDataPoint;
          const x = Math.floor(dataPoint.x);
          const y = Math.floor(dataPoint.y);
          const xLabel = context.chart.data.labels?.[x] || '';
          const yLabel = context.chart.data.labels?.[y] || '';
          return `True: ${yLabel}, Predicted: ${xLabel}, Count: ${dataPoint.v}`;
        }
      }
    },
    legend: {
      display: false
    }
  }
};

/**
 * Create feature importance chart data
 */
export const createFeatureImportanceChartData = (
  featureImportance: FeatureImportance[]
): ChartData<'bar'> => {
  // Sort by importance descending
  const sortedImportance = [...featureImportance].sort((a, b) => b.importance - a.importance);

  return {
    labels: sortedImportance.map(item => item.feature),
    datasets: [{
      label: 'Feature Importance',
      data: sortedImportance.map(item => item.importance),
      backgroundColor: 'rgba(79, 70, 229, 0.8)', // Indigo color
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 1
    }]
  };
};

/**
 * Create ROC curve chart data
 */
export const createROCCurveChartData = (
  tpr: number[],
  fpr: number[]
): ChartData<'line'> => {
  return {
    labels: fpr.map(String),
    datasets: [
      {
        label: 'ROC Curve',
        data: tpr,
        borderColor: 'rgba(16, 185, 129, 1)', // Green
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Random Classifier',
        data: fpr.map(x => x), // Diagonal line
        borderColor: 'rgba(156, 163, 175, 0.5)', // Gray
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }
    ]
  };
};

/**
 * Create ROC curve chart options
 */
export const rocCurveOptions: ChartOptions<'line'> = {
  scales: {
    x: {
      title: {
        display: true,
        text: 'False Positive Rate',
        font: {
          weight: 'bold'
        }
      },
      ticks: {
        max: 1,
        min: 0
      }
    },
    y: {
      title: {
        display: true,
        text: 'True Positive Rate',
        font: {
          weight: 'bold'
        }
      },
      ticks: {
        max: 1,
        min: 0
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          const index = context.dataIndex;
          const fprValue = context.chart.data.labels?.[index] || '0';
          const tprValue = context.raw as number;
          return `TPR: ${tprValue.toFixed(3)}, FPR: ${fprValue}`;
        }
      }
    }
  }
};

/**
 * Create metrics chart data
 */
export const createMetricsChartData = (
  metrics: ModelMetrics
): ChartData<'bar'> => {
  const { classLabels, precision, recall, f1Score } = metrics;

  return {
    labels: classLabels.map(String),
    datasets: [
      {
        label: 'Precision',
        data: precision,
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'Recall',
        data: recall,
        backgroundColor: 'rgba(139, 92, 246, 0.7)', // Purple
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'F1 Score',
        data: f1Score,
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // Green
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }
    ]
  };
};

/**
 * Create metrics chart options
 */
export const metricsChartOptions: ChartOptions<'bar'> = {
  scales: {
    y: {
      beginAtZero: true,
      max: 1,
      title: {
        display: true,
        text: 'Score',
        font: {
          weight: 'bold'
        }
      }
    },
    x: {
      title: {
        display: true,
        text: 'Class',
        font: {
          weight: 'bold'
        }
      }
    }
  }
};

/**
 * Create decision boundary data for 2D features
 */
export const createDecisionBoundaryData = (
  model: any,
  featureNames: [string, string],
  xRange: [number, number],
  yRange: [number, number],
  granularity: number = 50
): ChartData<'scatter'> => {
  // Generate grid points
  const xStep = (xRange[1] - xRange[0]) / granularity;
  const yStep = (yRange[1] - yRange[0]) / granularity;

  const points: Array<{ x: number, y: number, class: number }> = [];

  for (let x = xRange[0]; x <= xRange[1]; x += xStep) {
    for (let y = yRange[0]; y <= yRange[1]; y += yStep) {
      // Create point
      const point = { [featureNames[0]]: x, [featureNames[1]]: y };

      // Predict class
      try {
        const inputArray = [x, y];
        const prediction = model.predict([inputArray])[0];
        points.push({ x, y, class: prediction });
      } catch (error) {
        // Skip if prediction fails
      }
    }
  }

  // Group points by class
  const classes = Array.from(new Set(points.map(p => p.class)));

  // Create a dataset for each class
  const datasets = classes.map(cls => {
    const classPoints = points.filter(p => p.class === cls);

    // Generate a color for this class
    const hue = (cls * 137) % 360; // Use golden ratio to distribute colors
    const color = `hsl(${hue}, 70%, 70%)`;

    return {
      label: `Class ${cls}`,
      data: classPoints.map(p => ({ x: p.x, y: p.y })),
      backgroundColor: color,
      pointRadius: 2
    };
  });

  return {
    datasets
  };
};

/**
 * Create decision boundary chart options
 */
export const decisionBoundaryOptions = (
  featureNames: [string, string]
): ChartOptions<'scatter'> => {
  return {
    scales: {
      x: {
        title: {
          display: true,
          text: featureNames[0],
          font: {
            weight: 'bold'
          }
        }
      },
      y: {
        title: {
          display: true,
          text: featureNames[1],
          font: {
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const x = context.parsed.x;
            const y = context.parsed.y;
            return `${featureNames[0]}: ${x.toFixed(2)}, ${featureNames[1]}: ${y.toFixed(2)}`;
          }
        }
      }
    }
  };
};