import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const GenreChart = ({ data, title, colors }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
          font: {
            family: '"Montserrat", serif'
          }
        }
      },
      tooltip: {
        bodyFont: {
          family: '"Montserrat", serif'
        }
      },
      title: {
        display: true,
        text: title,
        color: 'white',
        font: {
          family: '"Montserrat", serif',
          size: 16
        }
      }
    }
  };

  const chartData = {
    labels: data.map(item => item.genre),
    datasets: [{
      data: data.map(item => item.count),
      backgroundColor: colors,
      borderWidth: 1
    }]
  };

  return <Pie data={chartData} options={options} />;
};

export default GenreChart;