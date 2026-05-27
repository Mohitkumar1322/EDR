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

  return (

    <div className="dashboard">

      {/* SIDEBAR */}

      <div className="sidebar">

        <div>

          <div className="brand">

            <div className="brand-logo">
              E
            </div>

            <div>

              <h2>Shadow One</h2>

              <p>Security Console</p>

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
              Threat Monitoring Dashboard
            </h1>

            <p>
              Realtime Endpoint Detection Platform
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

        {/* DASHBOARD PAGE */}

        {activePage === "dashboard" && (

          <>

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
                  Threat Level
                </div>

                <div className="overview-value yellow">
                  Medium
                </div>

              </div>

            </div>

            <div className="content-grid">

              {/* ALERTS */}

              <div className="panel">

                <div className="panel-header">
                  Live Threat Alerts
                </div>

                <div className="alerts-list">

                  {alerts
                    .slice()
                    .reverse()
                    .slice(0, 10)
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
                          <strong>MITRE:</strong>
                          {" "}
                          {alert.mitre}
                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {/* TELEMETRY */}

              <div className="panel">

                <div className="panel-header">
                  Live Telemetry
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

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </>

        )}

        {/* THREATS PAGE */}

        {activePage === "threats" && (

          <div className="full-panel">

            <div className="panel-header">
              Threat Detections
            </div>

            <div className="alerts-list">

              {alerts
                .slice()
                .reverse()
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
                      Host: {alert.hostname}
                    </div>

                    <div>
                      Process: {alert.process_name}
                    </div>

                    <div>
                      Parent: {alert.parent_process}
                    </div>

                    <div>
                      MITRE: {alert.mitre}
                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

        {/* HOST PAGE */}

        {activePage === "hosts" && (

          <div className="full-panel">

            <div className="panel-header">
              Connected Hosts
            </div>

            <div className="hosts-grid">

              {hosts.map((host, index) => (

                <div key={index} className="host-card">

                  <h2>{host}</h2>

                  <p>Agent Active</p>

                  <div className="host-status">
                    Online
                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

        {/* TELEMETRY PAGE */}

        {activePage === "telemetry" && (

          <div className="full-panel">

            <div className="panel-header">
              Full Telemetry Stream
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

                  </tr>

                </thead>

                <tbody>

                  {filteredEvents
                    .slice()
                    .reverse()
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

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

    </div>

  );
}

export default App;