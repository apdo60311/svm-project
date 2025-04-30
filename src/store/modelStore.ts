import { create } from 'zustand';
import { SVMConfig, ModelMetrics, FeatureImportance, ModelStatus } from '../types';

interface ModelState {
  // Model configuration
  config: SVMConfig;
  status: ModelStatus;
  
  // Model results
  metrics: ModelMetrics | null;
  featureImportance: FeatureImportance[] | null;
  trainingDuration: number | null; // in milliseconds
  
  // Model instance (can be any type since it depends on the library we use)
  modelInstance: any | null;
  
  // Actions
  setConfig: (config: Partial<SVMConfig>) => void;
  setStatus: (status: ModelStatus) => void;
  setMetrics: (metrics: ModelMetrics) => void;
  setFeatureImportance: (importance: FeatureImportance[]) => void;
  setTrainingDuration: (duration: number) => void;
  setModelInstance: (instance: any) => void;
  resetModel: () => void;
}

// Default SVM configuration
const defaultSVMConfig: SVMConfig = {
  kernel: 'rbf',
  C: 1.0,
  gamma: 'scale',
  degree: 3,
  coef0: 0.0,
  probabilistic: true,
};

export const useModelStore = create<ModelState>((set) => ({
  // Initial state
  config: defaultSVMConfig,
  status: ModelStatus.Untrained,
  metrics: null,
  featureImportance: null,
  trainingDuration: null,
  modelInstance: null,
  
  // Actions
  setConfig: (config: Partial<SVMConfig>) => set((state) => ({
    config: { ...state.config, ...config },
  })),
  
  setStatus: (status: ModelStatus) => set({ status }),
  
  setMetrics: (metrics: ModelMetrics) => set({ metrics }),
  
  setFeatureImportance: (importance: FeatureImportance[]) => set({ featureImportance: importance }),
  
  setTrainingDuration: (duration: number) => set({ trainingDuration: duration }),
  
  setModelInstance: (instance: any) => set({ 
    modelInstance: instance,
    status: ModelStatus.Trained
  }),
  
  resetModel: () => set({
    status: ModelStatus.Untrained,
    metrics: null,
    featureImportance: null,
    trainingDuration: null,
    modelInstance: null,
  }),
}));