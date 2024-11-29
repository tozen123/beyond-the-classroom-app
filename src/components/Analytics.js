import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../css/Analytics.css';

import Sidebar from './Sidebar';
import NavigationBar from './NavigationBar';
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
    const lineData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
          {
            label: 'Monthly Sales (in USD)',
            data: [500, 700, 800, 600, 900, 1000], // Dummy data for sales
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4, // For smooth lines
          },
        ],
      };
      
      const barData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
          {
            label: 'Revenue per Product (in USD)',
            data: [200, 400, 300, 500, 600, 700], // Dummy data for revenue
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
      

      const options = {
        responsive: true,
        maintainAspectRatio: false, // Ensures proper scaling
        plugins: {
          legend: {
            position: 'top', // Position of the legend
          },
          title: {
            display: true,
            text: 'Sales Analytics',
          },
        },
      };
      

  return (
    <div>
        <Sidebar />
        <NavigationBar />

        <div className="chart-container">
  <div className="chart-box">
    <h3>Line Chart</h3>
    <Line data={lineData} options={options} />
  </div>
  <div className="chart-box">
    <h3>Bar Chart</h3>
    <Bar data={barData} options={options} />
  </div>
</div>
    </div>
    

  );
};

export default Analytics;
