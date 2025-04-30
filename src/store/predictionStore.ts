import { create } from 'zustand';
import { PredictionInput, PredictionResult, DataProcessingStatus } from '../types';

interface PredictionState {
  // Single prediction
  inputData: PredictionInput | null;
  predictionResult: PredictionResult | null;
  
  // Batch prediction
  batchInputs: PredictionInput[] | null;
  batchResults: PredictionResult[] | null;
  
  // Status
  status: DataProcessingStatus;
  error: string | null;
  
  // Actions
  setInputData: (data: PredictionInput) => void;
  setPredictionResult: (result: PredictionResult) => void;
  setBatchInputs: (inputs: PredictionInput[]) => void;
  setBatchResults: (results: PredictionResult[]) => void;
  setStatus: (status: DataProcessingStatus) => void;
  setError: (error: string | null) => void;
  resetPredictions: () => void;
}

export const usePredictionStore = create<PredictionState>((set) => ({
  // Initial state
  inputData: null,
  predictionResult: null,
  batchInputs: null,
  batchResults: null,
  status: DataProcessingStatus.Idle,
  error: null,
  
  // Actions
  setInputData: (data: PredictionInput) => set({ inputData: data }),
  
  setPredictionResult: (result: PredictionResult) => set({ 
    predictionResult: result,
    status: DataProcessingStatus.Success
  }),
  
  setBatchInputs: (inputs: PredictionInput[]) => set({ batchInputs: inputs }),
  
  setBatchResults: (results: PredictionResult[]) => set({
    batchResults: results,
    status: DataProcessingStatus.Success
  }),
  
  setStatus: (status: DataProcessingStatus) => set({ status }),
  
  setError: (error: string | null) => set({ 
    error, 
    status: error ? DataProcessingStatus.Error : DataProcessingStatus.Idle
  }),
  
  resetPredictions: () => set({
    inputData: null,
    predictionResult: null,
    batchInputs: null,
    batchResults: null,
    status: DataProcessingStatus.Idle,
    error: null,
  }),
}));