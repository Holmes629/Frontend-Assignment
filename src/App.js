import React, { useState, useEffect } from 'react';
import './App.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';


// Import images and logos
import activeTab1Icon from './Assets/Sidepane/metrics-active.png'
import tab1Icon from './Assets/Sidepane/metrics.png'
import activeTab2Icon from './Assets/Sidepane/list-active.png'
import tab2Icon from './Assets/Sidepane/list.png'
import Logo from './Assets/Sidepane/TF_logo'
import Loader from './Assets/Sidepane/Spinner'

// Import mimic api functions
import {MimicMetrics, MimicLogs} from './Assignment-Data-Generator/Assignment/api-mimic'


function App() {
  // State to keep track of the active tab
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  const timeWindowsList = [
    60 * 5,
    60 * 15,
    60 * 30,
    60 * 60,
    60 * 60 * 3,
    60 * 60 * 6,
    60 * 60 * 12,
    60 * 60 * 24,
    60 * 60 * 24 * 2,
    60 * 60 * 24 * 7,
    60 * 60 * 24 * 30,
  ];
  const [activeTab, setActiveTab] = useState('tab1');

  // Function to change the active tab
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const [selectedTimeframe, setSelectedTimeframe] = useState('5m');
  const handleTimeframeChange = (event) => {
    setSelectedTimeframe(event.target.value);
  };

  const [currentDate, setCurrentDate] = useState(new Date()); // Store the current date
  const [pastDate, setPastDate] = useState(new Date());
  // Function to calculate the past date and time based on the selected timeframe
  useEffect(() => {
    // Calculate the current date when the component mounts
    const now = new Date();
    setCurrentDate(now);
    
    // Calculate the past date based on the selected timeframe
    const calculatePastTime = () => {
      const timeAmount = parseInt(selectedTimeframe.slice(0, -1)); // Extract the numeric part
      const unit = selectedTimeframe.slice(-1); // Extract the time unit (h for hours, m for minutes)
      const newDate = new Date(now); // Copy current date for manipulation
      
      if (unit === 'h') {
        newDate.setHours(now.getHours() - timeAmount);
      } else if (unit === 'm') {
        newDate.setMinutes(now.getMinutes() - timeAmount);
      }
      return newDate;
    };

    setPastDate(calculatePastTime());
  }, [selectedTimeframe]); 

  var [date,setDate] = useState(new Date());
    
  useEffect(() => {
      var timer = setInterval(()=>setDate(new Date()), 1000 )
      return function cleanup() {
          clearInterval(timer)
      }
  });
  // Mimic metrics
  const [selectedTimeframeIndex, setSelectedTimeframeIndex] = useState(0); // Default index
  // const [metrics, setMetrics] = useState(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  const [cpuChartData, setCpuChartData] = useState({});
  const [networkChartData, setNetworkChartData] = useState({});
  const [diskIopsChartData, setDiskIopsChartData] = useState({});
  const [memoryChartData, setMemoryChartData] = useState({});

  const chartOptions = {
    responsive: true,
    grid: true,
    plugins: {
      tooltip: {
        titleFont: {
          size: 1 // Set the tooltip title font size here
        },
        bodyFont: {
          size: 14 // Set the tooltip body font size here
        },
      },
      legend: {
        position: 'bottom', 
        labels: {
          usePointStyle: true, // to use squares rather than the line default
          pointStyle: 'rectRounded', // to make the points square with rounded corners
          pointStyle: 'rect', // to make the points square with no rounded corners
          padding: 20, // space between symbols and text
          boxWidth: 15,
          borderRadius: 10,
          color: 'black',
          font: {
            size: 9,
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 9
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 9
          }
        }
      }
    },
  };

  useEffect(() => {
    const currentTime = Date.now();
    const selectedTimeframe = timeWindowsList[selectedTimeframeIndex] * 1000;
    const startTs = currentTime - selectedTimeframe;
  
    setIsMetricsLoading(true);
  
    MimicMetrics.fetchMetrics({ startTs: startTs, endTs: currentTime })
      .then(data => {
        setIsMetricsLoading(false);
  
        setCpuChartData(processMetricData(data, 'CPU Usage', 'rgb(75, 192, 192)', 'rgb(192, 75, 192)', 'rgb(75, 175, 75)'));
        setNetworkChartData(processMetricData(data, 'Network Usage', 'rgb(75, 192, 192)', 'rgb(192, 75, 192)', 'rgb(75, 175, 75)'));
        setMemoryChartData(processMetricData(data, 'Memory Usage', 'rgb(75, 192, 192)', 'rgb(192, 75, 192)', 'rgb(75, 175, 75)'));
        setDiskIopsChartData(processDiskIops(data, 'Disk IOPS', 'rgb(192, 75, 192)', 'rgb(75, 175, 75)')); // Assuming 'Disk IOPS' data is available
      })
      .catch(error => {
        setIsMetricsLoading(false);
        console.error('Error fetching metrics data: ', error);
      });
  }, [selectedTimeframeIndex]); // Make sure to include all dependencies
  
  // Helper function to process and format chart data for each metric
  function processMetricData(metricsData, metricName, color1, color2, color3) {
      const metric = metricsData.find(m => m.name === metricName);
      if (!metric) {
        console.warn(`Metric ${metricName} not found.`);
        return {};
      }
      
      // Used metric data
      const usedMetricValues = metric.graphLines.find(line => line.name === 'Used')?.values || [];
      const labels = usedMetricValues.map(dataPoint => {
        const date = new Date(dataPoint.timestamp);
        // return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        return `${date.getHours()}:${date.getMinutes()}`;
      });
  
      const dataPoints = usedMetricValues.map(dataPoint => dataPoint.value);

      // Requested metric data
      const reqMetricValues = metric.graphLines.find(line => line.name === 'Requested')?.values || []; 
      const dataPoints2 = reqMetricValues.map(dataPoint2 => dataPoint2.value);

      // Limit metric data
      const limitMetricValues = metric.graphLines.find(line => line.name === 'Limits')?.values || [];  
      const dataPoints3 = limitMetricValues.map(dataPoint3 => dataPoint3.value);
      
      return {
        labels,
        datasets: [
          {
            label: `Used`,
            data: dataPoints,
            fill: false,
            borderColor: color1,
            backgroundColor: color1,
            borderWidth: 1.5,
            pointRadius: 0,
          },
          {
            label: `Requested`,
            data: dataPoints2,
            fill: false,
            borderColor: color2,
            backgroundColor: color2,
            borderWidth: 1.5,
            pointRadius: 0,
          },
          {
            label: `Limits`,
            data: dataPoints3,
            fill: false,
            borderColor: color3,
            backgroundColor: color3,
            borderWidth: 1.5,
            pointRadius: 0,
          }
        ]
      };
  }
  function processDiskIops(metricsData, metricName, color1, color2) {
      const metric = metricsData.find(m => m.name === metricName);
      if (!metric) {
        console.warn(`Metric ${metricName} not found.`);
        return {};
      }
      
      const usedMetricValues = metric.graphLines.find(line => line.name === 'Read')?.values || [];
      const labels = usedMetricValues.map(dataPoint => {
        const date = new Date(dataPoint.timestamp);
        return `${date.getHours()}:${date.getMinutes()}`;
      });
  
      const dataPoints = usedMetricValues.map(dataPoint => dataPoint.value);

      // write metric for Disk Iops
      const writeMetricValues = metric.graphLines.find(line => line.name === 'Write')?.values || [];
      const dataPoints2 = writeMetricValues.map(dataPoint2 => dataPoint2.value);
      
      return {
        labels,
        datasets: [
          {
            label: `Read`,
            data: dataPoints,
            fill: false,
            borderColor: color1,
            backgroundColor: color1,
            borderWidth: 1.5,
            pointRadius: 0,
          },
          {
            label: `Write`,
            data: dataPoints2,
            fill: false,
            borderColor: color2,
            backgroundColor: color2,
            borderWidth: 1.5,
            pointRadius: 0,
          }
        ]
      };
  }

  // Mimic logs
    // For loading
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    useEffect(() => {
      const currentTime = Date.now();
      const selectedTimeframe = timeWindowsList[selectedTimeframeIndex] * 1000; // Convert to milliseconds
      const startTs = currentTime - selectedTimeframe;
      const endTs = currentTime;
    
      // Set loading to true when starting to fetch logs
      setIsLoading(true);
    
      const fetchLogs = async () => {
        try {
          const retrievedLogs = await MimicLogs.fetchPreviousLogs({ startTs, endTs, limit: 100 });
          setLogs(retrievedLogs);
        } catch (err) {
          console.error("Error fetching logs:", err);
        } finally {
          // Set loading to false after fetching logs or if there is an error
          setIsLoading(false);
        }
      };
    
      fetchLogs();
    
      // Cleanup function to set loading to false when component is unmounted or before re-running the effect
      return () => setIsLoading(false);
    }, [selectedTimeframeIndex]);
  const mapTimeframeToIndex = (timeframe) => {
    const mappings = {
      '5m': 0,
      '15m': 1,
      '30m': 2,
      '1h': 3,
      '3h': 4,
      '6h': 5,
      // ... add other mappings as needed
    };
    return mappings[timeframe] || 0;
  };
  
  useEffect(() => {
    setSelectedTimeframeIndex(mapTimeframeToIndex(selectedTimeframe));
  }, [selectedTimeframe]);
  
  useEffect(() => {
    const currentTime = Date.now();
    const selectedTimeframe = timeWindowsList[selectedTimeframeIndex] * 1000; // Convert to milliseconds
    const startTs = currentTime;
    const endTs = currentTime- selectedTimeframe;
    const limit = 100; // Assuming we want to limit to the last 100 logs for the example

    MimicLogs.fetchPreviousLogs({ startTs, endTs, limit })
      .then((retrievedLogs) => {
        setLogs(retrievedLogs);
      })
      .catch((err) => {
        console.error("Error fetching logs:", err);
      });
  }, [selectedTimeframeIndex]);

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-logo">
          <Logo></Logo> {/* Use the Logo component here */}
        </div>
        <ul className="navbar-nav">
          <li className={`nav-item ${activeTab === 'tab1' ? 'active' : ''}`} onClick={() => handleTabSwitch('tab1')}          >
          <img src={activeTab === 'tab1' ? activeTab1Icon : tab1Icon} alt="Metrics" className="tab1Icon" /> Metrics
          </li>
          <li className={`nav-item ${activeTab === 'tab2' ? 'active' : ''}`} onClick={() => handleTabSwitch('tab2')}>
            <img src={activeTab === 'tab2' ? activeTab2Icon : tab2Icon} alt="Logs" className="tab2Icon" />Logs
          </li>
        </ul>
        <div className="timeframe-dropdown">
          <select id="timeframe-select" value={selectedTimeframe} onChange={handleTimeframeChange}>
            <option value="5m">Last 5 minutes</option>
            <option value="15m">Last 15 minutes</option>
            <option value="30m">Last 30 minutes</option>
            <option value="1h">Last 1 hour</option>
            <option value="3h">Last 3 hours</option>
            <option value="6h">Last 6 hours</option>
          </select>
        </div>
      </nav>
      <div className='Current_time_date'>
          <p> Time : {date.toLocaleTimeString()}, Date : {date.toLocaleDateString()}</p>
      </div>
      {/* Content based on active tab */}
      <div className="tab-content">
        {activeTab === 'tab1' && (
          <div>
            <div className="info-displayer">
              <h1>Metrics</h1>
              <p>
                {pastDate.toLocaleDateString()} {pastDate.toLocaleTimeString()} to {currentDate.toLocaleDateString()} {currentDate.toLocaleTimeString()}
              </p>
            </div>
            <div className='Metric-div'>
              {isMetricsLoading && (
                <div className="metric-loading-container">
                  <div className='metric-loader'>
                    <Loader ></Loader>
                  </div>
                  <p>Loading the Metrics, please wait...</p>
                </div>
              )}
              <div className="metrics-container">
                {/* CPU and Network metrics side by side */}
                <div className="metric-chart-container">
                  <h2>CPU Usage</h2>
                  {cpuChartData.datasets && (
                    <Line data={cpuChartData} options={chartOptions} />
                  )}
                </div>
                <div className="metric-chart-container">
                  <h2>Network Usage</h2>
                  {networkChartData.datasets && (
                    <Line data={networkChartData} options={chartOptions} />
                  )}
                </div>

                {/* Disk and Memory metrics side by side */}
                <div className="metric-chart-container">
                  <h2>Memory Usage</h2>
                  {memoryChartData.datasets && (
                    <Line data={memoryChartData} options={chartOptions} />
                  )}
                </div>
                <div className="metric-chart-container">
                  <h2>Disk IOPS</h2>
                  {diskIopsChartData.datasets && (
                    <Line data={diskIopsChartData} options={chartOptions} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'tab2' && 
          <div>
            <div className="info-displayer">
              <h1>Logs</h1>
              <p>
                showing logs for: {pastDate.toLocaleDateString()} {pastDate.toLocaleTimeString()} to {currentDate.toLocaleDateString()} {currentDate.toLocaleTimeString()}
              </p>
            </div>
            <div className='Logs_div'>
                {isLoading && (
                  <div className="loading-container">
                    <div className='loader'>
                      <Loader ></Loader>
                    </div>
                    <p>Loading the logs, please wait...</p>
                  </div>
                )}
                {logs.map((log, index) => (
                  <div key={index} className="log-entry">
                    <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}: </span>
                    {log.message}
                  </div>
                ))}
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default App;