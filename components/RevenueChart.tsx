import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface RevenueChartProps {
  data: { labels: string[]; values: number[] };
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: data.values,
        borderColor: '#FF9800', 
        backgroundColor: 'rgba(255, 152, 0, 0.15)', // cam nhạt
        tension: 0.4,
      },
    ],
  };

  const maxY = Math.max(...data.values, 0);
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 18,
            weight: 700,
          },
        },
      },
      title: {
        display: true,
        text: 'Doanh thu theo thời gian',
        font: {
          size: 22,
          weight: 700,
        },
        padding: { top: 20, bottom: 10 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: maxY > 0 ? maxY * 1.1 : undefined, // thêm padding phía trên
        max: maxY > 0 ? maxY : undefined,
      },
    },
  };

    return (
      <div style={{height: 500, width: '100%'}}>
        <Line data={chartData} options={options} />
      </div>
    );
};

export default RevenueChart;
