import { create } from 'zustand';
import { DataSet, PreprocessingOptions, DataProcessingStatus } from '../types';

interface DataState {
  // Original data
  dataset: DataSet | null;
  status: DataProcessingStatus;
  error: string | null;
  
  // Preprocessing options
  preprocessingOptions: PreprocessingOptions;
  
  // Processed data
  processedData: {
    trainingData: any[] | null;
    testingData: any[] | null;
    trainingLabels: any[] | null;
    testingLabels: any[] | null;
  };
  
  // Actions
  setDataset: (dataset: DataSet) => void;
  clearDataset: () => void;
  setStatus: (status: DataProcessingStatus) => void;
  setError: (error: string | null) => void;
  setPreprocessingOptions: (options: Partial<PreprocessingOptions>) => void;
  setProcessedData: (data: any) => void;
}

// Initial preprocessing options
const defaultPreprocessingOptions: PreprocessingOptions = {
  targetVariable: '',
  features: [],
  missingValueStrategy: 'mean',
  scaling: 'standard',
  trainTestSplit: 0.2,
};

export const useDataStore = create<DataState>((set) => ({
  // Initial state
  dataset: null,
  status: DataProcessingStatus.Idle,
  error: null,
  preprocessingOptions: defaultPreprocessingOptions,
  processedData: {
    trainingData: null,
    testingData: null,
    trainingLabels: null,
    testingLabels: null,
  },
  
  // Actions
  setDataset: (dataset: DataSet) => set({ 
    dataset, 
    status: DataProcessingStatus.Success,
    error: null
  }),
  
  clearDataset: () => set({ 
    dataset: null, 
    status: DataProcessingStatus.Idle,
    error: null,
    processedData: {
      trainingData: null,
      testingData: null,
      trainingLabels: null,
      testingLabels: null,
    }
  }),
  
  setStatus: (status: DataProcessingStatus) => set({ status }),
  
  setError: (error: string | null) => set({ 
    error, 
    status: error ? DataProcessingStatus.Error : DataProcessingStatus.Idle 
  }),
  
  setPreprocessingOptions: (options: Partial<PreprocessingOptions>) => set((state) => ({
    preprocessingOptions: {
      ...state.preprocessingOptions,
      ...options,
    }
  })),
  
  setProcessedData: (data) => set({ processedData: data }),
}));