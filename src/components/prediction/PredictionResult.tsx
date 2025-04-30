import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePredictionStore } from '../../store/predictionStore';
import Card from '../common/Card';
import { CheckCircle, PieChart } from 'lucide-react';
import { formatPercent } from '../../utils/formatting';

const PredictionResult: React.FC = () => {
  const { predictionResult, inputData } = usePredictionStore();
  
  if (!predictionResult || !inputData) {
    return null;
  }
  
  const { predictedClass, confidenceScores } = predictionResult;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          variant="bordered" 
          className="bg-white dark:bg-gray-900 transition-colors duration-150"
        >
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                  delay: 0.2
                }}
              >
                <CheckCircle className="h-5 w-5 text-success-500 dark:text-success-400" />
              </motion.div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Prediction Result
              </h3>
            </div>
            
            <motion.div 
              className="flex flex-col sm:flex-row sm:divide-x divide-gray-200 dark:divide-gray-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="pb-4 sm:pb-0 sm:pr-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Predicted Class
                </div>
                <motion.div 
                  className="mt-1 text-2xl font-semibold text-primary-600 dark:text-primary-400"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {String(predictedClass)}
                </motion.div>
              </div>
              
              {confidenceScores && (
                <div className="pt-4 sm:pt-0 sm:pl-4 flex-1">
                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <PieChart className="h-4 w-4" />
                    <span>Confidence Scores</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    <AnimatePresence mode="wait">
                      {Object.entries(confidenceScores)
                        .filter(([_, score]) => score >= 0.01)
                        .sort(([_, a], [__, b]) => b - a)
                        .map(([label, score], index) => (
                          <motion.div
                            key={label}
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + (index * 0.05) }}
                          >
                            <div className="w-24 text-sm text-gray-700 dark:text-gray-300">
                              {label}:
                            </div>
                            <div className="w-16 text-sm font-medium text-gray-900 dark:text-gray-100">
                              {formatPercent(score)}
                            </div>
                            <div className="ml-2 flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${
                                  String(predictedClass) === label
                                    ? 'bg-primary-600 dark:bg-primary-500'
                                    : 'bg-gray-400 dark:bg-gray-600'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${score * 100}%` }}
                                transition={{ 
                                  duration: 0.5, 
                                  delay: 0.2 + (index * 0.05),
                                  ease: "easeOut"
                                }}
                              />
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
            
            <motion.div 
              className="pt-4 border-t border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Input Values
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <AnimatePresence>
                  {Object.entries(inputData).map(([feature, value], index) => (
                    <motion.div
                      key={feature}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-lg shadow-sm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + (index * 0.05) }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {feature}
                      </div>
                      <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                        {String(value)}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default PredictionResult;