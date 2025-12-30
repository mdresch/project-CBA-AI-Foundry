import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useTheme } from '../context/useTheme';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const { isDarkTheme } = useTheme();
  const textColor = isDarkTheme ? 'rgb(255, 255, 255)' : 'rgb(17, 24, 39)';
  const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  const chartOptions = {
    responsive: true,
    color: textColor,
    scales: {
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        },
      },
      y: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
  };

  const promptData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: [300, 450, 320, 500, 380, 420],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Token Usage',
        data: [1000, 1200, 900, 1500, 1100, 1300],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const categoryData = {
    labels: ['Code', 'Text', 'Analysis', 'Creative', 'Other'],
    datasets: [{
      data: [30, 25, 20, 15, 10],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
      ],
    }],
  };

  return (
    <div className={`min-h-screen pt-16 ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Metrics */}
          <div className={`p-6 rounded-lg shadow-lg ${
            isDarkTheme ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            <Line options={chartOptions} data={promptData} />
          </div>

          {/* Category Distribution */}
          <div className={`p-6 rounded-lg shadow-lg ${
            isDarkTheme ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Prompt Categories</h2>
            <div className="w-full max-w-md mx-auto">
              <Doughnut data={categoryData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`p-6 rounded-lg shadow-lg ${
            isDarkTheme ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`p-4 rounded-lg ${
                  isDarkTheme ? 'bg-zinc-800' : 'bg-gray-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Code Review Request</h3>
                      <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        Analyzed React component structure
                      </p>
                    </div>
                    <span className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      {format(new Date().setDate(new Date().getDate() - i), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Settings */}
          <div className={`p-6 rounded-lg shadow-lg ${
            isDarkTheme ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Model Settings Analysis</h2>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                <h3 className="font-medium mb-2">Temperature</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <p className={`mt-2 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Current: 0.7 - Balanced creativity and precision
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkTheme ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                <h3 className="font-medium mb-2">Max Tokens</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <p className={`mt-2 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Current: 2048 - Standard response length
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;