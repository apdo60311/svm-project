import React from 'react';
import { Link } from 'react-router-dom';
import { useModelStore } from '../store/modelStore';
import { ModelStatus } from '../types';

import ModelConfigForm from '../components/model/ModelConfigForm';
import ModelPerformance from '../components/model/ModelPerformance';
import Button from '../components/common/Button';
import { ChevronRight } from 'lucide-react';

const ModelPage: React.FC = () => {
  const { status: modelStatus } = useModelStore();
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Model Configuration</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration form */}
        <div>
          <ModelConfigForm />
        </div>
        
        {/* Performance metrics */}
        <div>
          <ModelPerformance />
        </div>
      </div>
      
      {modelStatus === ModelStatus.Trained && (
        <div className="flex justify-end mt-6">
          <Link to="/results">
            <Button 
              size="md"
              icon={<ChevronRight className="h-4 w-4" />}
              iconPosition="right"
            >
              View Results
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ModelPage;