// src/svm/svm.service.ts
import SVM from 'libsvm-js/asm';
import {
  DataPoint,
  SVMConfig,
  ModelMetrics,
  FeatureImportance,
  PredictionInput,
  PredictionResult
} from '../types';

/** Convert object-row data to numeric matrix */
const convertToArrayFormat = (data: DataPoint[]): number[][] =>
  data.map(row =>
    Object.values(row).map(v => (typeof v === 'number' ? v : 0))
  );

/** Train SVM model */
export const trainSVMModel = (
  trainingData: DataPoint[],
  trainingLabels: (string | number)[],
  config: SVMConfig
): { model: any; trainingTime: number } => {
  const start = performance.now();

  const X = convertToArrayFormat(trainingData);
  // Ensure labels are distinct integers ≥0
  const y = trainingLabels.map(l =>
    typeof l === 'number' ? l : String(l).charCodeAt(0)
  );

  // Map config → libsvm-js options
  const opts: any = {
    type: SVM.SVM_TYPES.C_SVC,
    kernel: SVM.KERNEL_TYPES[config.kernel.toUpperCase()],
    cost: config.C,
    probabilityEstimates: config.probabilistic
  };
  if (config.kernel === 'rbf' && config.gamma !== 'auto') {
    opts.gamma = config.gamma;
  }
  if (config.kernel === 'polynomial') {
    opts.degree = config.degree;
    opts.coef0 = config.coef0;
  }

  // Create & train
  const model = new SVM(opts);
  model.train(X, y);

  const trainingTime = performance.now() - start;
  return { model, trainingTime };
};

/** Evaluate accuracy, precision, recall, F1, confusion matrix */
export const calculateMetrics = (
  model: any,
  testingData: DataPoint[],
  testingLabels: (string | number)[]
): ModelMetrics => {
  const X = convertToArrayFormat(testingData);
  const yTrue = testingLabels.map(l =>
    typeof l === 'number' ? l : String(l).charCodeAt(0)
  );

  // Use predictOne for single-sample prediction :contentReference[oaicite:6]{index=6}
  const predictions = X.map(x => model.predictOne(x));

  // Unique classes (sorted)
  const classes = Array.from(new Set([...yTrue, ...predictions])).sort();

  // Confusion matrix
  const matrix = classes.map(() =>
    Array(classes.length).fill(0)
  );
  predictions.forEach((p, i) => {
    matrix[classes.indexOf(yTrue[i])][classes.indexOf(p)]++;
  });

  const correct = predictions.filter((p, i) => p === yTrue[i]).length;
  const accuracy = correct / predictions.length;

  const precision = classes.map((_, j) => {
    const colSum = matrix.reduce((sum, row) => sum + row[j], 0);
    return colSum ? matrix[j][j] / colSum : 0;
  });
  const recall = classes.map((_, i) => {
    const rowSum = matrix[i].reduce((a, b) => a + b, 0);
    return rowSum ? matrix[i][i] / rowSum : 0;
  });
  const f1Score = classes.map((_, i) =>
    precision[i] + recall[i]
      ? (2 * precision[i] * recall[i]) / (precision[i] + recall[i])
      : 0
  );

  const classLabels = testingLabels.every(l => typeof l === 'string')
    ? classes.map(c => String.fromCharCode(c))
    : classes;

  return {
    accuracy,
    precision,
    recall,
    f1Score,
    confusionMatrix: matrix,
    classLabels
  };
};

/** Feature importance for linear SVM via w = Σ αᵢ yᵢ xᵢ :contentReference[oaicite:7]{index=7} */
export const calculateFeatureImportance = (
  model: any,
  featureNames: string[]
): FeatureImportance[] => {
  // Only for linear kernel
  if (model.options.kernel !== SVM.KERNEL_TYPES.LINEAR) {
    // fallback: equal importance
    return featureNames.map(f => ({ feature: f, importance: 0 }));
  }

  // Parse weight vector from serialized model
  const serialized = model.serializeModel();
  // The weights line is the last line before "SV"
  const lines = serialized.trim().split('\n');
  const weightLine = lines.find((l: any) => l.startsWith('w '));
  const weights = weightLine
    ? weightLine
      .substr(2)
      .split(' ')
      .map(parseFloat)
    : Array(featureNames.length).fill(0);

  const absWeights = weights.map(Math.abs);
  const maxW = Math.max(...absWeights, 1);
  return featureNames
    .map((f, i) => ({ feature: f, importance: absWeights[i] / maxW }))
    .sort((a, b) => b.importance - a.importance);
};

/** Single prediction */
export const predict = (
  model: any,
  input: PredictionInput,
  featureNames: string[],
  classLabels: (string | number)[],
  isNumericLabels: boolean
): PredictionResult => {
  const x = featureNames.map(f =>
    typeof input[f] === 'number' ? input[f] : 0
  );
  const pred = model.predictOne(x);

  const predictedClass = isNumericLabels
    ? pred
    : String.fromCharCode(pred);

  let confidenceScores: Record<string, number> | undefined;
  if (model.predictProbability) {
    const probsArr = model.predictProbability([x])[0];
    confidenceScores = {};
    // libsvm-js returns an object { label:…, probability:… }[]
    (probsArr as any[]).forEach((p: any) => {
      confidenceScores![String(p.label)] = p.probability;
    });
  }

  return { predictedClass, confidenceScores };
};

/** Batch prediction */
export const predictBatch = (
  model: any,
  inputs: PredictionInput[],
  featureNames: string[],
  classLabels: (string | number)[],
  isNumericLabels: boolean
): PredictionResult[] =>
  inputs.map(inp => predict(model, inp, featureNames, classLabels, isNumericLabels));
