import React, { 
  useState, 
  useMemo, 
  useCallback 
} from "react";
import { 
  FaProjectDiagram, 
  FaChartBar, 
  FaBell,
  FaClipboardList 
} from 'react-icons/fa';

import Card from "../Componenets/Card";
import CircleChart from "../Componenets/CircleChart";
import RecentActivity from "../Componenets/RecentActivity";
import BarChart from "../Componenets/BarChart";
import '../assets/css/Dashboard.css';

// Utility function for date formatting
const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const diffInDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  return `${diffInDays} days ago`;
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: [
      {
        icon: <FaProjectDiagram />,
        title: "Total Projects",
        value: "24",
        trend: "+12%",
        trendUp: true,
        color: "rgba(59, 130, 246, 0.1)"
      },
      {
        icon: <FaChartBar />,
        title: "Activities",
        value: "145",
        trend: "+8%",
        trendUp: true,
        color: "rgba(52, 211, 153, 0.1)"
      },
      {
        icon: <FaBell />,
        title: "Alerts",
        value: "5",
        trend: "-2",
        trendUp: false,
        color: "rgba(239, 68, 68, 0.1)"
      },
      {
        icon: <FaClipboardList />,
        title: "Tasks",
        value: "28",
        trend: "+5",
        trendUp: true,
        color: "rgba(245, 158, 11, 0.1)"
      }
    ],
    projects: {
      heading: 'Projects',
      subheading: 'Active Project Management',
      icon: FaProjectDiagram,
      color: 'rgba(59, 130, 246, 0.1)',
      projects: [
        { 
          projectName: 'Project X', 
          status: 'Due in 3 days', 
          priority: 'high',
          progress: 65,
          team: 4
        },
        { 
          projectName: 'Project Y', 
          status: 'Due in 5 days', 
          priority: 'medium',
          progress: 40,
          team: 3
        },
        { 
          projectName: 'Project Z', 
          status: 'Due in 8 days', 
          priority: 'low',
          progress: 20,
          team: 2
        },
      ],
    },
    analysis: {
      heading: 'Analysis',
      subheading: 'Comprehensive Data Insights',
      icon: FaChartBar,
      color: 'rgba(16, 185, 129, 0.1)',
      projects: [
        { 
          projectName: 'Market Research', 
          status: 'In Progress', 
          complexity: 'High',
          completionRate: 75,
          dataPoints: 120
        },
        { 
          projectName: 'Financial Model', 
          status: 'Pending', 
          complexity: 'Medium',
          completionRate: 45,
          dataPoints: 80
        },
        { 
          projectName: 'Risk Assessment', 
          status: 'Initiated', 
          complexity: 'Low',
          completionRate: 25,
          dataPoints: 50
        },
      ],
    },
    alerts: {
      heading: 'Alerts',
      subheading: 'Critical Notifications',
      icon: FaBell,
      color: 'rgba(245, 158, 11, 0.1)',
      projects: [
        { 
          projectName: 'Security Update', 
          status: 'High Priority', 
          type: 'Security',
          timestamp: new Date(),
          actionRequired: true
        },
        { 
          projectName: 'Performance Anomaly', 
          status: 'Medium Priority', 
          type: 'Performance',
          timestamp: new Date(Date.now() - 86400000),
          actionRequired: false
        },
        { 
          projectName: 'Compliance Check', 
          status: 'Low Priority', 
          type: 'Compliance',
          timestamp: new Date(Date.now() - 172800000),
          actionRequired: true
        },
      ],
    }
  });

  const [activeSection, setActiveSection] = useState('projects');

  const recentActivities = useMemo(() => ({
    recentActDes: [
      { 
        head: 'Project X', 
        des: 'Updated 2 hours ago', 
        timestamp: new Date('2024-02-10T14:30:00'),
        icon: FaProjectDiagram
      },
      { 
        head: 'Project Y', 
        des: 'Completed 5 days ago', 
        timestamp: new Date('2024-02-05T09:15:00'),
        icon: FaChartBar
      },
      { 
        head: 'Project Z', 
        des: 'Updated 10 days ago', 
        timestamp: new Date('2024-01-31T11:45:00'),
        icon: FaClipboardList
      }
    ]
  }), []);

  const costData = useMemo(() => ({
    Circle1: { 
      name: 'Operating Costs', 
      value: 2900, 
      color: '#3b82f6', 
      percentage: 25,
      trend: 'up'
    },
    Circle2: { 
      name: 'Marketing Expenses', 
      value: 1521.13, 
      color: '#10b981', 
      percentage: 50,
      trend: 'stable'
    },
    Circle3: { 
      name: 'R&D Investment', 
      value: 1321.31, 
      color: '#f59e0b', 
      percentage: 75,
      trend: 'down'
    },
  }), []);

  const aspectsData = useMemo(() => [
    { name: 'Revenue', height: 40, color: '#3b82f6' },
    { name: 'Expenses', height: 100, color: '#10b981' },
    { name: 'Profit', height: 80, color: '#f59e0b' },
    { name: 'Investment', height: 120, color: '#6366f1' },
    { name: 'Growth', height: 50, color: '#8b5cf6' },
    { name: 'Innovation', height: 90, color: '#ec4899' },
  ], []);

  const renderCardData = useCallback((data) => {
    const Icon = data.icon;
    return (
      <div 
        className="col-12 col-md-12 col-lg-6 col-xl-4 col-xxl-4"
      >
        <div 
          className={`professional-card ${activeSection === data.heading.toLowerCase() ? 'active' : ''}`}
          onClick={() => setActiveSection(data.heading.toLowerCase())}
        >
          <div className="card-header">
            <Icon className="card-icon" />
            <h3>{data.heading}</h3>
          </div>
          <div className="card-content">
            <p>{data.subheading}</p>
            {data.projects.map((project, index) => (
              <div key={index} className="project-item">
                <span>{project.projectName}</span>
                <span className={`status ${project.priority || project.complexity}`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [activeSection]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {/* Stats Cards */}
        <div className="row g-3">
          {dashboardData.stats.map((stat, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-3">
              <Card
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                trend={stat.trend}
                trendUp={stat.trendUp}
                color={stat.color}
              />
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="row g-3 mt-3 d-n">
          <div className="col-12 col-lg-8">
            <div className="chart-container p-3 bg-white rounded">
              <h5 className="mb-3">Project Progress</h5>
              <div className="chart-scroll-container">
                <BarChart props={aspectsData} />
              </div>
            </div>
          </div>
          
          <div className="col-12 col-lg-4">
            <div className="chart-container p-3 bg-white rounded">
              <h5 className="mb-3">Task Distribution</h5>
              <CircleChart data={costData} />
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="row mt-3">
          <div className="col-12">
            <div className="recent-activity-container p-3 bg-white rounded">
              <h5 className="mb-3">Recent Activity</h5>
              <div className="activity-scroll-container">
                <RecentActivity recentAct={recentActivities} />
              </div>
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="row g-3 mt-3 section-container">
          {renderCardData(dashboardData.projects)}
          {renderCardData(dashboardData.analysis)}
          {renderCardData(dashboardData.alerts)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
