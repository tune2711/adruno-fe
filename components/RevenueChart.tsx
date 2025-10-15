import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  Plugin
} from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export interface RevenueChartProps {
  data: { labels: string[]; values: number[] };
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

// no custom shadow plugin (kept simple for compatibility)

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const maxY = Math.max(...data.values, 0);

  const chartData: any = {
    labels: data.labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: data.values,
        borderColor: '#FF9800',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#FF9800',
        tension: 0.36,
        fill: true,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(255,152,0,0.12)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(255,152,0,0.20)');
          gradient.addColorStop(1, 'rgba(255,152,0,0.02)');
          return gradient;
        },
        borderJoinStyle: 'round',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Doanh thu theo',
        font: { size: 18, weight: '700' as any },
        padding: { top: 8, bottom: 12 },
      },
      tooltip: {
        callbacks: {
          label(context) {
            const v = context.parsed.y ?? 0;
            return `Doanh thu: ${currencyFormatter.format(v)}`;
          }
        }
      }
    },
    layout: { padding: { left: 12, right: 12, top: 8, bottom: 8 } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0, autoSkip: true, color: '#6b7280' }
      },
      y: {
        beginAtZero: true,
        suggestedMax: maxY > 0 ? maxY * 1.15 : undefined,
        ticks: {
          callback(value) {
            // value may be number or string
            const num = Number(value as any) || 0;
            return currencyFormatter.format(num).replace('₫', 'đ');
          },
          color: '#6b7280'
        },
        grid: { color: 'rgba(220,220,220,0.6)' }
      }
    },
    animation: { duration: 600, easing: 'easeOutQuart' },
  };

  return (
    <div style={{ width: '100%', height: 420 }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;
