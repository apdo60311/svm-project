import React from 'react';
import { DataSet } from '../../types';
import Card from '../common/Card';
import { formatFileSize } from '../../utils/formatting';

interface DataSummaryProps {
  dataset: DataSet;
}

const DataSummary: React.FC<DataSummaryProps> = ({ dataset }) => {
  const { filename, data, columns, size, uploadedAt } = dataset;

  // Calculate data type of each column
  const columnTypes = columns.reduce((acc, column) => {
    let type = 'unknown';
    
    // Check the data type of non-null values
    const nonNullValues = data
      .map(row => row[column])
      .filter(val => val !== null && val !== undefined && val !== '');
    
    if (nonNullValues.length > 0) {
      const firstValue = nonNullValues[0];
      
      if (typeof firstValue === 'number') {
        // Check if all values are integers
        const allIntegers = nonNullValues.every(val => 
          typeof val === 'number' && Number.isInteger(val)
        );
        
        type = allIntegers ? 'integer' : 'float';
      } else if (typeof firstValue === 'string') {
        type = 'string';
      } else if (typeof firstValue === 'boolean') {
        type = 'boolean';
      }
    }
    
    // Check if this might be a categorical column
    if (type === 'string' || type === 'integer') {
      const uniqueValues = new Set(nonNullValues);
      if (uniqueValues.size <= 20 && uniqueValues.size < nonNullValues.length / 2) {
        type = 'categorical';
      }
    }
    
    return { ...acc, [column]: type };
  }, {} as Record<string, string>);

  // Count missing values per column
  const missingValueCounts = columns.reduce((acc, column) => {
    const count = data.filter(row => 
      row[column] === null || row[column] === undefined || row[column] === ''
    ).length;
    
    return { ...acc, [column]: count };
  }, {} as Record<string, number>);

  return (
    <Card title="Dataset Summary" variant="bordered">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filename</h4>
            <p className="text-sm text-gray-900 dark:text-gray-100">{filename}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Size</h4>
            <p className="text-sm text-gray-900 dark:text-gray-100">{formatFileSize(size)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Rows</h4>
            <p className="text-sm text-gray-900 dark:text-gray-100">{data.length}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Columns</h4>
            <p className="text-sm text-gray-900 dark:text-gray-100">{columns.length}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded</h4>
            <p className="text-sm text-gray-900 dark:text-gray-100">{uploadedAt.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Column Information</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Column
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Missing Values
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    % Missing
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {columns.map((column) => (
                  <tr key={column} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {columnTypes[column]}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {missingValueCounts[column]}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {((missingValueCounts[column] / data.length) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );

};

export default DataSummary;