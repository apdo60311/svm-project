import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Button from '../common/Button';
import Alert from '../common/Alert';
import { parseCSV, parseExcel } from '../../utils/dataProcessing';
import { useDataStore } from '../../store/dataStore';
import { DataProcessingStatus } from '../../types';

const FileUpload: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  
  const { setDataset, setStatus, setError: setGlobalError } = useDataStore();
  const status = useDataStore(state => state.status);
  
  const isLoading = status === DataProcessingStatus.Loading;
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setError(null);
    setStatus(DataProcessingStatus.Loading);
    
    try {
      // Basic file validation
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File is too large. Maximum size is 10MB.');
      }
      
      // Parse based on file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        const dataset = await parseCSV(file);
        setDataset(dataset);
      } 
      else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        const dataset = await parseExcel(file);
        setDataset(dataset);
      } 
      else {
        throw new Error('Unsupported file format. Please upload CSV or Excel files.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setGlobalError(errorMessage);
      setStatus(DataProcessingStatus.Error);
    }
  }, [setDataset, setStatus, setGlobalError]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-all duration-200 ease-in-out
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-900/10' 
            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
          }
          ${isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:border-gray-400 dark:hover:border-gray-600'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <motion.div 
          className="text-center"
          animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Upload className={`
            mx-auto h-12 w-12 mb-4 transition-colors duration-200
            ${isDragActive 
              ? 'text-primary-500 dark:text-primary-400' 
              : 'text-gray-400 dark:text-gray-500'
            }
          `} />
          
          <motion.p 
            className="text-base font-medium text-gray-900 dark:text-gray-100"
            animate={{ 
              scale: isDragActive ? 1.05 : 1,
              color: isDragActive ? 'var(--primary-500)' : 'currentColor'
            }}
          >
            {isDragActive ? 'Drop your file here' : 'Drag & drop your data file'}
          </motion.p>
          
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Supports CSV and Excel files (up to 10MB)
          </p>
          
          {!isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                type="button" 
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={isLoading}
              >
                Select File
              </Button>
            </motion.div>
          )}
          
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                className="mt-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="flex space-x-2 justify-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-primary-500 dark:bg-primary-400"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Processing file...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert 
              variant="error" 
              title="Upload Error"
              dismissible
              onDismiss={() => setError(null)}
            >
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-error-500 dark:text-error-400 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-colors duration-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Supported File Format Guidelines:</h4>
        <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1.5 list-disc list-inside marker:text-gray-400 dark:marker:text-gray-500">
          <li>CSV files with comma-separated values</li>
          <li>Excel workbooks (.xlsx or .xls)</li>
          <li>First row should contain column headers</li>
          <li>Numeric data should be properly formatted (no text in numeric columns)</li>
          <li>Missing values should be represented as empty cells or standard notation (NA, NULL, etc.)</li>
          <li>Target/label column should be clearly identifiable</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default FileUpload;