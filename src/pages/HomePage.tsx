import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Settings, 
  BarChart2, 
  Target, 
  ChevronRight, 
  BrainCircuit 
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const HomePage: React.FC = () => {
  const workflow = [
    {
      number: "01",
      title: "Upload & Prepare Data",
      description: "Upload your data in CSV or Excel format. Preview and preprocess it to prepare for training.",
      icon: <Database className="h-6 w-6 text-primary-600" />,
      link: "/data",
      linkText: "Upload Data"
    },
    {
      number: "02",
      title: "Configure & Train",
      description: "Configure your SVM model parameters and train it on your prepared data.",
      icon: <Settings className="h-6 w-6 text-primary-600" />,
      link: "/model",
      linkText: "Configure Model"
    },
    {
      number: "03",
      title: "Analyze Results",
      description: "Visualize model performance, feature importances, and understand your model's behavior.",
      icon: <BarChart2 className="h-6 w-6 text-primary-600" />,
      link: "/results",
      linkText: "See Results"
    },
    {
      number: "04",
      title: "Make Predictions",
      description: "Use your trained model to make predictions on new data points or in batches.",
      icon: <Target className="h-6 w-6 text-primary-600" />,
      link: "/predict",
      linkText: "Predict"
    }
  ];

  return (
    <div className="animate-fadeIn space-y-8">
      {/* Hero Section */}
      <div className="pb-8">
        <div className="flex items-center justify-center h-20 mb-4">
          <BrainCircuit className="h-16 w-16 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          SVM Classification App
        </h1>
        <p className="text-center text-lg text-gray-500 max-w-3xl mx-auto">
          A comprehensive tool for building, visualizing, and deploying Support Vector Machine classification models
        </p>
      </div>

      {/* Workflow Section */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {workflow.map((step) => (
          <Card key={step.number} variant="bordered" className="relative overflow-hidden dark:bg-gray-800">
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                {step.number}
              </span>
            </div>
            <div className="pt-8">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{step.title}</h3>
                <div className="text-primary-600 dark:text-primary-400">
                  {step.icon}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 min-h-[80px]">{step.description}</p>
              <div className="mt-4">
                <Link to={step.link}>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full flex justify-between dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    icon={<ChevronRight className="h-4 w-4" />} 
                    iconPosition="right"
                  >
                    {step.linkText}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>


      {/* Features Section */}
      <div className="p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Interactive Data Processing</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload and preprocess your data with intuitive controls and visualizations.</p>
          </div>
          <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Flexible Model Configuration</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose from different kernels and fine-tune hyperparameters with real-time feedback.</p>
          </div>
          <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Comprehensive Visualizations</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Explore model performance through confusion matrices, ROC curves, and more.</p>
          </div>
          <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Feature Importance Analysis</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Understand which features drive your model's predictions most effectively.</p>
          </div>
          <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Batch Prediction Support</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Make predictions on individual data points or process entire datasets at once.</p>
          </div>
          <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Beginner-Friendly Interface</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Helpful tooltips and presets make machine learning accessible to users of all experience levels.</p>
          </div>
        </div>
      </div>
      {/* Get Started Button */}
      <div className="flex justify-center pt-4 pb-8">
        <Link to="/data">
          <Button size="lg">Get Started</Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;