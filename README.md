# React Metric and Log Dashboard

## Project Overview

This repository houses a React application that acts as a dynamic dashboard to visualize metrics and logs. The application features an interface that toggles between two primary tabs – one for displaying metric charts and the other for viewing logs.

## Features

- **Tab Selection**: Users can switch between the Metrics and Logs tabs to view the corresponding data.
- **Dynamic Charting**: The application uses `react-chartjs-2` to render live charts for CPU Usage, Network Usage, Memory Usage, and Disk IOPS with real-time data.
- **Real-Time Data Handling**: Uses simulated API functions (`MimicMetrics` and `MimicLogs`) to fetch and display time-based metrics data and application logs.
- **Responsive Layout**: Ensures the interface adjusts elegantly across different screen sizes.

## Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js

### Installation

1. **Clone the Repository**

```sh
   git clone https://github.com/YourUsername/react-metrics-dashboard.git
   cd react-metrics-dashboard
Install Dependencies
While in the project directory, install the necessary dependencies:
sh
   npm install
Running the Application
Use the following command to start the development server:
sh
  npm start
This will serve the app at http://localhost:3000.
Open your preferred web browser and navigate to http://localhost:3000 to view the application in action.
Using the Dashboard
Metric Monitoring: In the Metrics tab, you can visualize different system metrics through charts.
Log Viewing: The Logs tab provides a scrollable view of system logs, allowing you to monitor recent activities based on the retrieved logs.
Timeframe Selection: You can adjust the timeframe to retrieve metrics and logs from the past 5, 15, 30 minutes, or 1, 3, 6 hours through the dropdown selector.
