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
        borderColor: '#FF9800', // màu cam giao diện
        backgroundColor: 'rgba(255, 152, 0, 0.15)', // cam nhạt
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Doanh thu theo ngày' },
    },
  };

  return <div style={{height: 1000 , width: 1000}}><Line data={chartData} options={options} /></div>;
};

export default RevenueChart;
