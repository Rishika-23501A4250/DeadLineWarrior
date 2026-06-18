import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "../styles/Analytics.css";
import logo from "../assets/logo.png";
import { getTasks } from "../services/taskService"; 
import "../styles/MainHome.css";

function Analytics() {
  const [activeTasks, setActiveTasks] = useState([]);
  const [historyTasks, setHistoryTasks] = useState([]);
  
  // 1. Filter states
  const [viewType, setViewType] = useState("monthly"); // 'monthly' or 'yearly'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"));

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const activeRes = await getTasks();
      setActiveTasks(activeRes.data || []);

      const historyRes = await API.get("/history");
      setHistoryTasks(historyRes.data || []);
    } catch (error) {
      console.log("Error loading analytics data:", error);
    }
  };

  // Helper to check if a task falls within the selected date range filter
  const filterByDateRange = (task) => {
    const dateStr = task.createdAt || task.deadline; 
    if (!dateStr) return true; 

    const taskDate = new Date(dateStr);
    const taskYear = taskDate.getFullYear().toString();
    const taskMonth = (taskDate.getMonth() + 1).toString().padStart(2, "0");

    if (viewType === "yearly") {
      return taskYear === selectedYear;
    } else {
      return taskYear === selectedYear && taskMonth === selectedMonth;
    }
  };

  // 2. Filter data arrays based on selection
  const filteredActive = activeTasks.filter(filterByDateRange);
  const filteredHistory = historyTasks.filter(filterByDateRange);

  // 3. Metric Calculations (Using filtered variants)
  const completedCount = filteredHistory.length; 
  
  const pendingCount = filteredActive.filter(task => {
    return !task.deadline || new Date(task.deadline) >= new Date();
  }).length;

  const missedCount = filteredActive.filter(task => {
    return task.deadline && new Date(task.deadline) < new Date();
  }).length;

  const totalTasksCount = completedCount + pendingCount + missedCount;

  // 4. Percentages calculation
  const completedPercent = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;
  const pendingPercent = totalTasksCount > 0 ? Math.round((pendingCount / totalTasksCount) * 100) : 0;
  const missedPercent = totalTasksCount > 0 ? 100 - (completedPercent + pendingPercent) : 0;
  
  const donutStyle = {
    background: `conic-gradient(
      #2ecc71 0% ${completedPercent}%, 
      #3498db ${completedPercent}% ${completedPercent + pendingPercent}%, 
      #e74c3c ${completedPercent + pendingPercent}% 100%
    )`
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-box">
          <img src={logo} alt="logo" />
        </div>
        <nav className="mainnav">
          <Link to="/mainhome">🏠 Home</Link>
          <Link to="/history">📜 Task History</Link>
          <Link to="/analytics">📊 Analytics</Link>
          <Link to="/about">ℹ️ About</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="content">
        
        {/* FILTER CONTROLS DROP-DOWN SECTION */}
        <div className="filter-container" style={{ display: "flex", gap: "15px", marginBottom: "20px", background: "#fff", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <div>
            <label style={{ marginRight: "8px", fontWeight: "600" }}>View Mode:</label>
            <select value={viewType} onChange={(e) => setViewType(e.target.value)} style={{ padding: "5px 10px", borderRadius: "4px" }}>
              <option value="monthly">Monthly View</option>
              <option value="yearly">Yearly View</option>
            </select>
          </div>

          <div>
            <label style={{ marginRight: "8px", fontWeight: "600" }}>Year:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ padding: "5px 10px", borderRadius: "4px" }}>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {viewType === "monthly" && (
            <div>
              <label style={{ marginRight: "8px", fontWeight: "600" }}>Month:</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: "5px 10px", borderRadius: "4px" }}>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Chart Visuals */}
        <div className="chart-section">
          <div className="donut-container">
            <div className="donut-chart" style={donutStyle}></div>
            <div className="donut-hole">{totalTasksCount}</div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: "25px", marginBottom: "30px", fontWeight: "500" }}>
          <div><span style={{color: "#2ecc71", marginRight: "5px"}}>●</span> Completed ({completedPercent}%)</div>
          <div><span style={{color: "#3498db", marginRight: "5px"}}>●</span> Pending ({pendingPercent}%)</div>
          <div><span style={{color: "#e74c3c", marginRight: "5px"}}>●</span> Missed ({missedPercent}%)</div>
        </div>

        {/* Metric Summary Cards */}
        <div className="dashboard-cards">
          <div className="card">
            <h3>Total Tasks</h3>
            <h2>{totalTasksCount}</h2>
          </div>

          <div className="card" style={{ borderLeft: "5px solid #2ecc71" }}>
            <h3>Completed</h3>
            <h2>{completedCount}</h2>
          </div>

          <div className="card" style={{ borderLeft: "5px solid #3498db" }}>
            <h3>Pending</h3>
            <h2>{pendingCount}</h2>
          </div>

          <div className="card" style={{ borderLeft: "5px solid #e74c3c" }}>
            <h3>Missed</h3>
            <h2>{missedCount}</h2>
          </div>
        </div>

        {/* QUICK INSIGHTS SECTION (Safely placed inside main wrapper content) */}
        <div className="quick-insights-container">
          <h3 className="insights-title">Quick Insights</h3>
          
          <div className="insights-list">
            
            {/* Card 1: On-time Completion Rate */}
            <div className="insight-item">
              <div className="insight-icon-box blue-bg">
                <span className="insight-icon">📈</span>
              </div>
              <div className="insight-info">
                <span className="insight-label">On-time Completion Rate</span>
                <h2 className="insight-value blue-text">
                  {totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0}%
                </h2>
                <span className="insight-trend positive">↑ 10% vs previous 7 days</span>
              </div>
            </div>

            {/* Card 2: Overdue Rate */}
            <div className="insight-item">
              <div className="insight-icon-box orange-bg">
                <span className="insight-icon">🕒</span>
              </div>
              <div className="insight-info">
                <span className="insight-label">Overdue Rate</span>
                <h2 className="insight-value orange-text">
                  {totalTasksCount > 0 ? Math.round((missedCount / totalTasksCount) * 100) : 0}%
                </h2>
                <span className="insight-trend negative">↓ 5% vs previous 7 days</span>
              </div>
            </div>

            {/* Card 3: Pending Tasks */}
            <div className="insight-item">
              <div className="insight-icon-box yellow-bg">
                <span className="insight-icon">📋</span>
              </div>
              <div className="insight-info">
                <span className="insight-label">Pending Tasks</span>
                <h2 className="insight-value yellow-text">{pendingCount}</h2>
                <span className="insight-trend neutral">No change vs previous 7 days</span>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

export default Analytics;