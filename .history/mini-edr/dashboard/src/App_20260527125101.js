import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import "./styles.css";

const socket = io("http://127.0.0.1:8000");

function App() {

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {

    fetchTelemetry();

    socket.on("new_event", (event) => {

      setEvents((prev) => [...prev, event]);

    });

    return () => {
      socket.off("new_event");
    };

  }, []);

  const fetchTelemetry = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/telemetry"
      );

      setEvents(response.data);

    } catch (error) {

      console.log(error);

    }
  };

  const alerts = events.filter(
    (event) => event.alert
  );

  const hosts = [
    ...new Set(events.map(
      e => e.hostname
    ))
  ];

  const filteredEvents = events.filter((event) =>
    event.process_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const getSeverityClass = (severity) => {

    if (severity === "critical") return "critical";

    if (severity === "high") return "high";

    if (severity === "medium") return "medium";

    return "safe";
  };

  const criticalAlerts = alerts.filter(
    e => e.severity === "critical"
  ).length;

  const highAlerts = alerts.filter(
    e => e.severity === "high"
  ).length;

  const mediumAlerts = alerts.filter(
    e => e.severity === "medium"
  ).length;

  return (

    <div className="dashboard">

      {/* SIDEBAR */}

      <div className="sidebar">

        <div>

          <div className="brand">

            <div className="brand-logo">
              S
            </div>

            <div>

              <h2>ShadowOne</h2>

              <p>EDR Platform</p>

            </div>

          </div>

          <div className="menu">

            <div
              className={`menu-item ${activePage === "dashboard" ? "active" : ""}`}
              onClick={() => setActivePage("dashboard")}
            >
              Dashboard
            </div>

            <div
              className={`menu-item ${activePage === "telemetry" ? "active" : ""}`}
              onClick={() => setActivePage("telemetry")}
            >
              Telemetry
            </div>

            <div
              className={`menu-item ${activePage === "threats" ? "active" : ""}`}
              onClick={() => setActivePage("threats")}
            >
              Threats
            </div>

            <div
              className={`menu-item ${activePage === "hosts" ? "active" : ""}`}
              onClick={() => setActivePage("hosts")}
            >
              Hosts
            </div>

          </div>

        </div>

        <div className="agent-status">

          <div className="status-dot"></div>

          Agent Connected

        </div>

      </div>

      {/* MAIN */}

      <div className="main">

        {/* HEADER */}

        <div className="header">

          <div>

            <h1>
              ShadowOne Security Operations
            </h1>

            <p>
              Realtime Endpoint Detection & Threat Analytics
            </p>

          </div>

          <input
            type="text"
            placeholder="Search process..."
            value={search}
            className="search"
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* DASHBOARD */}

        {activePage === "dashboard" && (

          <>

            {/* OVERVIEW */}

            <div className="overview-grid">

              <div className="overview-card">

                <div className="overview-title">
                  Total Events
                </div>

                <div className="overview-value">
                  {events.length}
                </div>

              </div>

              <div className="overview-card alert-glow">

                <div className="overview-title">
                  Threat Alerts
                </div>

                <div className="overview-value red">
                  {alerts.length}
                </div>

              </div>

              <div className="overview-card">

                <div className="overview-title">
                  Connected Hosts
                </div>

                <div className="overview-value">
                  {hosts.length}
                </div>

              </div>

              <div className="overview-card">

                <div className="overview-title">
                  Critical Threats
                </div>

                <div className="overview-value red">
                  {criticalAlerts}
                </div>

              </div>

            </div>

            {/* THREAT ANALYTICS */}

            <div className="analytics-grid">

              <div className="analytics-card critical-border">

                <h3>Critical Alerts</h3>

                <div className="analytics-number">
                  {criticalAlerts}
                </div>

              </div>

              <div className="analytics-card high-border">

                <h3>High Severity</h3>

                <div className="analytics-number">
                  {highAlerts}
                </div>

              </div>

              <div className="analytics-card medium-border">

                <h3>Medium Severity</h3>

                <div className="analytics-number">
                  {mediumAlerts}
                </div>

              </div>

            </div>

            {/* MAIN CONTENT */}

            <div className="content-grid">

              {/* ALERTS */}

              <div className="panel">

                <div className="panel-header">
                  Live Threat Detections
                </div>

                <div className="alerts-list">

                  {alerts
                    .slice()
                    .reverse()
                    .slice(0, 15)
                    .map((alert, index) => (

                    <div
                      key={index}
                      className={`threat-card ${getSeverityClass(alert.severity)}`}
                    >

                      <div className="threat-top">

                        <div className="threat-name">
                          {alert.alert}
                        </div>

                        <div className={`severity-badge ${getSeverityClass(alert.severity)}`}>
                          {alert.severity}
                        </div>

                      </div>

                      <div className="threat-info">

                        <div>
                          <strong>Host:</strong>
                          {" "}
                          {alert.hostname}
                        </div>

                        <div>
                          <strong>Process:</strong>
                          {" "}
                          {alert.process_name}
                        </div>

                        <div>
                          <strong>Parent:</strong>
                          {" "}
                          {alert.parent_process}
                        </div>

                      </div>

                      {/* MITRE */}

                      <div className="mitre-box">

                        <span className="mitre-label">
                          MITRE ATT&CK
                        </span>

                        <span className="mitre-id">
                          {alert.mitre}
                        </span>

                      </div>

                      {/* THREAT SCORE */}

                      <div className="score-section">

                        <div className="score-header">

                          <span>
                            Threat Score
                          </span>

                          <span>
                            {alert.threat_score || 0}
                          </span>

                        </div>

                        <div className="score-bar">

                          <div
                            className="score-fill"
                            style={{
                              width: `${Math.min(alert.threat_score || 0, 100)}%`
                            }}
                          ></div>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {/* TELEMETRY */}

              <div className="panel">

                <div className="panel-header">
                  Live Telemetry Stream
                </div>

                <div className="telemetry-scroll">

                  <table>

                    <thead>

                      <tr>

                        <th>Host</th>
                        <th>Process</th>
                        <th>Parent</th>
                        <th>PID</th>
                        <th>Status</th>
                        <th>MITRE</th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredEvents
                        .slice()
                        .reverse()
                        .slice(0, 100)
                        .map((event, index) => (

                        <tr key={index}>

                          <td>{event.hostname}</td>

                          <td>{event.process_name}</td>

                          <td>{event.parent_process}</td>

                          <td>{event.pid}</td>

                          <td>

                            {event.alert ? (

                              <span className={`severity-badge ${getSeverityClass(event.severity)}`}>
                                ALERT
                              </span>

                            ) : (

                              <span className="safe-badge">
                                SAFE
                              </span>

                            )}

                          </td>

                          <td>

                            {event.mitre ? (

                              <span className="mitre-id">
                                {event.mitre}
                              </span>

                            ) : (

                              "-"
                            )}

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </>

        )}

      </div>

    </div>

  );
}

export default App;