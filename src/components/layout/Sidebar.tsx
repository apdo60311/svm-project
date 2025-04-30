import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Database, 
  Settings, 
  BarChart2, 
  Target, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDataStore } from '../../store/dataStore';
import { useModelStore } from '../../store/modelStore';
import { DataProcessingStatus, ModelStatus } from '../../types';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  
  const dataStatus = useDataStore(state => state.status);
  const modelStatus = useModelStore(state => state.status);
  
  const hasData = dataStatus === DataProcessingStatus.Success;
  const isModelTrained = modelStatus === ModelStatus.Trained;
  
  const navigation = [
    { name: 'Home', href: '/', icon: Home, current: location.pathname === '/' },
    { name: 'Data', href: '/data', icon: Database, current: location.pathname === '/data' },
    { name: 'Model', href: '/model', icon: Settings, current: location.pathname === '/model', disabled: !hasData },
    { name: 'Results', href: '/results', icon: BarChart2, current: location.pathname === '/results', disabled: !isModelTrained },
    { name: 'Predict', href: '/predict', icon: Target, current: location.pathname === '/predict', disabled: !isModelTrained },
  ];

  return (
    <motion.div 
      className="relative flex flex-col flex-shrink-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-colors"
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex-shrink-0 px-4 flex items-center">
          {!collapsed && (
            <motion.span 
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              SVM Classifier
            </motion.span>
          )}
        </div>
        
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                to={item.disabled ? '#' : item.href}
                className={`
                  ${item.current 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  transition-all duration-150 ease-in-out
                `}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                }}
              >
                <IconComponent
                  className={`
                    ${item.current ? 'text-primary-600 dark:text-primary-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'}
                    mr-3 flex-shrink-0 h-5 w-5 transition-colors
                  `}
                  aria-hidden="true"
                />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.div>
  );
};

export default Sidebar;