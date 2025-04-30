import React from 'react';
import { useDataStore } from '../store/dataStore';
import { DataProcessingStatus } from '../types';
import { Link } from 'react-router-dom';

import FileUpload from '../components/data/FileUpload';
import DataTable from '../components/data/DataTable';
import DataSummary from '../components/data/DataSummary';
import PreprocessingForm from '../components/data/PreprocessingForm';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { ChevronRight, RefreshCw } from 'lucide-react';

const DataPage: React.FC = () => {
  const { dataset, status, clearDataset, processedData } = useDataStore();
  
  const handleClearData = () => {
    clearDataset();
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Data Management</h2>
        
        {dataset && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearData}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Reset Data
          </Button>
        )}
      </div>
      
      {!dataset ? (
        <FileUpload />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataSummary dataset={dataset} />
            
            <PreprocessingForm />
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
            <DataTable 
              data={dataset.data}
              columns={dataset.columns}
              maxHeight="400px"
            />
          </div>
          
          {processedData && processedData.trainingData && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Processed Data</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Training Data" variant="bordered">
                  <div className="max-h-[300px] overflow-y-auto">
                    <DataTable 
                      data={processedData.trainingData}
                      columns={Object.keys(processedData.trainingData[0] || {})}
                      maxHeight="240px"
                    />
                  </div>
                </Card>
                
                <Card title="Testing Data" variant="bordered">
                  <div className="max-h-[300px] overflow-y-auto">
                    <DataTable 
                      data={processedData.testingData || []}
                      columns={Object.keys(processedData.testingData?.[0] || {})}
                      maxHeight="240px"
                    />
                  </div>
                </Card>
              </div>
              
              <div className="flex justify-end mt-6">
                <Link to="/model">
                  <Button 
                    size="md"
                    icon={<ChevronRight className="h-4 w-4" />}
                    iconPosition="right"
                  >
                    Configure Model
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          {status === DataProcessingStatus.Error && (
            <Alert variant="error" title="Error Processing Data">
              There was an error processing your data. Please check your preprocessing options and try again.
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default DataPage;