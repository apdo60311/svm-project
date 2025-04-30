// Data types for the application

export interface DataPoint {
  [key: string]: number | string | null;
}

export interface DataSet {
  data: DataPoint[];
  columns: string[];
  filename: string;
  size: number; // in bytes
  uploadedAt: Date;
}

export interface PreprocessingOptions {
  targetVariable: string;
  features: string[];
  missingValueStrategy: 'mean' | 'median' | 'mode' | 'remove' | 'constant';
  constantValue?: number;
  scaling: 'none' | 'minmax' | 'standard' | 'robust';
  trainTestSplit: number; // ratio between 0 and 1
}

export interface SVMConfig {
  kernel: 'linear' | 'rbf' | 'polynomial' | 'sigmoid';
  C: number; // regularization parameter
  gamma: 'auto' | 'scale' | number;
  degree: number;
  coef0: number;
  probabilistic: boolean;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number[];
  recall: number[];
  f1Score: number[];
  confusionMatrix: number[][];
  classLabels: (string | number)[];
  crossValidation?: number[];
}

export interface PredictionInput {
  [key: string]: number | string;
}

export interface PredictionResult {
  predictedClass: string | number;
  probability?: number;
  confidenceScores?: { [key: string]: number };
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export enum DataProcessingStatus {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error'
}

export enum ModelStatus {
  Untrained = 'untrained',
  Training = 'training',
  Trained = 'trained',
  Error = 'error'
}