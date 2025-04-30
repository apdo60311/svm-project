import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrainCircuit, Menu, Moon, Sun } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useModelStore } from '../../store/modelStore';
import { useDarkMode } from '../../utils/useDarkMode';

const Navbar: React.FC = () => {
  const location = useLocation();
  const dataset = useDataStore(state => state.dataset);
  const modelStatus = useModelStore(state => state.status);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isDark, setIsDark] = useDarkMode();

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  // Get title based on current route
  const getTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Welcome to SVM Classifier';
      case '/data':
        return 'Data Management';
      case '/model':
        return 'Model Configuration';
      case '/results':
        return 'Model Results & Insights';
      case '/predict':
        return 'Make Predictions';
      default:
        return 'SVM Classifier';
    }
  };

  return (
    <nav className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 transition-colors duration-150">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BrainCircuit className="h-8 w-8 text-primary-600 dark:text-primary-500" />
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                SVM Classifier
              </span>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <h1 className="text-lg font-medium text-gray-700 dark:text-gray-200 self-center transition-colors">
                {getTitle()}
              </h1>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {dataset && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Dataset:</span> {dataset.filename}
              </div>
            )}
            
            {modelStatus === 'trained' && (
              <div className="flex items-center px-3 py-1 text-sm text-success-700 dark:text-success-400 bg-success-50 dark:bg-success-900/30 rounded-full transition-colors">
                <span className="inline-block w-2 h-2 mr-2 bg-success-500 rounded-full"></span>
                Model Trained
              </div>
            )}

            <button
              onClick={toggleDarkMode}
              className="button-hover p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="button-hover inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden animate-slide-in-right">
          <div className="pt-2 pb-3 space-y-1 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
            <Link 
              to="/"
              className={`block px-3 py-2 text-base font-medium transition-colors
                ${location.pathname === '/' 
                  ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Home
            </Link>
            <Link 
              to="/data"
              className={`block px-3 py-2 text-base font-medium transition-colors
                ${location.pathname === '/data' 
                  ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Data
            </Link>
            <Link 
              to="/model"
              className={`block px-3 py-2 text-base font-medium transition-colors
                ${location.pathname === '/model' 
                  ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Model
            </Link>
            <Link 
              to="/results"
              className={`block px-3 py-2 text-base font-medium transition-colors
                ${location.pathname === '/results' 
                  ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Results
            </Link>
            <Link 
              to="/predict"
              className={`block px-3 py-2 text-base font-medium transition-colors
                ${location.pathname === '/predict' 
                  ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Predict
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;