import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import "./styles.css";

const socket = io("http://127.0.0.1:8000");

function App() {

  const [events, setEvents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [networkData, setNetworkData] = useState([]);

  const [search, setSearch] = useState("");

  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {

    fetchTelemetry();

    fetchIncidents();

    fetchNetwork();

    socket.on("new_event", (event) => {

      setEvents((prev) => [...prev, event]);

    });

    socket.on("new_incident", (incident) => {

      setIncidents((prev) => [...prev, incident]);

    });

    return () => {

      socket.off("new_event");

      socket.off("new_incident");

    };

  }, []);

  // =========================
  // FETCH TELEMETRY
  // =========================

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

  // =========================
  // FETCH INCIDENTS
  // =========================

  const fetchIncidents = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/incidents"
      );

      setIncidents(response.data);

    } catch (error) {

      console.log(error);

    }
  };

  // =========================
  // FETCH NETWORK DATA
  // =========================

  const fetchNetwork = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/network"
      );

      setNetworkData(response.data);

    } catch (error) {

      console.log(error);

    }
  };

  // =========================
  // ALERTS
  // =========================

  const alerts = events.filter(
    (event) => event.alert
  );

  // =========================
  // HOSTS
  // =========================

  const hosts = [
    ...new Set(events.map(
      e => e.hostname
    ))
  ];

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredEvents = events.filter((event) =>
    event.process_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // =========================
  // SEVERITY CLASS
  // =========================

  const getSeverityClass = (severity) => {

    if (severity === "critical") return "critical";

    if (severity === "high") return "high";

    if (severity === "medium") return "medium";

    return "safe";
  };

  return (

    <div className="dashboard">

      {/* ================= SIDEBAR ================= */}

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

          {/* MENU */}

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

            <div
              className={`menu-item ${activePage === "incidents" ? "active" : ""}`}
              onClick={() => setActivePage("incidents")}
            >
              Incidents
            </div>

            <div
              className={`menu-item ${activePage === "network" ? "active" : ""}`}
              onClick={() => setActivePage("network")}
            >
              Network
            </div>

          </div>

        </div>

        {/* AGENT STATUS */}

        <div className="agent-status">

          <div className="status-dot"></div>

          Agent Connected

        </div>

      </div>

      {/* ================= MAIN ================= */}

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

        {/* ================= DASHBOARD ================= */}

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
                  Active Incidents
                </div>

                <div className="overview-value yellow">
                  {incidents.length}
                </div>

              </div>

            </div>

            {/* CONTENT */}

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
                          <strong>Host:</strong> {alert.hostname}
                        </div>

                        <div>
                          <strong>Process:</strong> {alert.process_name}
                        </div>

                        <div>
                          <strong>Parent:</strong> {alert.parent_process}
                        </div>

                      </div>

                      <div className="mitre-box">

                        <span className="mitre-label">
                          MITRE ATT&CK
                        </span>

                        <span className="mitre-id">
                          {alert.mitre}
                        </span>

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

        {/* ================= THREATS PAGE ================= */}

        {activePage === "threats" && (

          <div className="full-panel">

            <div className="panel-header">
              Threat Intelligence
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

                    <div>Host: {alert.hostname}</div>

                    <div>Process: {alert.process_name}</div>

                    <div>Parent: {alert.parent_process}</div>

                  </div>

                  <div className="mitre-box">

                    <span className="mitre-label">
                      MITRE ATT&CK
                    </span>

                    <span className="mitre-id">
                      {alert.mitre}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

        {/* ================= HOSTS PAGE ================= */}

        {activePage === "hosts" && (

          <div className="full-panel">

            <div className="panel-header">
              Connected Hosts
            </div>

            <div className="hosts-grid">

              {hosts.map((host, index) => (

                <div
                  key={index}
                  className="host-card"
                >

                  <h2>{host}</h2>

                  <p>Endpoint Agent Active</p>

                  <div className="host-status">
                    Online
                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

        {/* ================= INCIDENTS PAGE ================= */}

        {activePage === "incidents" && (

          <div className="full-panel">

            <div className="panel-header">
              Threat Correlation Incidents
            </div>

            <div className="alerts-list">

              {incidents
                .slice()
                .reverse()
                .map((incident, index) => (

                <div
                  key={index}
                  className="threat-card high"
                >

                  <div className="threat-top">

                    <div className="threat-name">
                      Correlated Incident
                    </div>

                    <div className="severity-badge high">
                      {incident.severity}
                    </div>

                  </div>

                  <div className="threat-info">

                    <div>
                      <strong>Host:</strong> {incident.hostname}
                    </div>

                    <div>
                      <strong>Attack Chain:</strong>
                    </div>

                    <div>
                      {incident.attack_chain?.join(" → ")}
                    </div>

                  </div>

                  <div className="mitre-box">

                    <span className="mitre-label">
                      MITRE ATT&CK
                    </span>

                    <span className="mitre-id">
                      {incident.mitre}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

        {/* ================= NETWORK PAGE ================= */}

        {activePage === "network" && (

          <div className="full-panel">

            <div className="panel-header">
              Live Network Connections
            </div>

            <div className="telemetry-scroll">

              <table>

                <thead>

                  <tr>

                    <th>Local IP</th>
                    <th>Local Port</th>
                    <th>Remote IP</th>
                    <th>Remote Port</th>
                    <th>Status</th>

                  </tr>

                </thead>

                <tbody>

                  {networkData.map((conn, index) => (

                    <tr key={index}>

                      <td>{conn.local_ip}</td>

                      <td>{conn.local_port}</td>

                      <td>{conn.remote_ip}</td>

                      <td>{conn.remote_port}</td>

                      <td>

                        <span className="safe-badge">
                          {conn.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

        {/* ================= TELEMETRY PAGE ================= */}

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
                    <th>MITRE</th>

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

        )}

      </div>

    </div>

  );
}

export default App;