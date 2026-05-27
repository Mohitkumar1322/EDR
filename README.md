# ShadowOne EDR

Realtime Endpoint Detection & Response Platform for behavioral threat detection, incident correlation, attack visibility, and security monitoring.

ShadowOne is a modern SOC-style EDR platform built using Python, FastAPI, React, MongoDB, and WebSockets. It collects endpoint telemetry in realtime, detects suspicious behavior, maps detections to MITRE ATT&CK techniques, correlates attack chains into incidents, and streams live security events to an interactive dashboard.

---

# Dashboard Preview

## Main Dashboard

```md id="2jlwm1"
<img width="1659" height="864" alt="Screenshot 2026-05-27 132219" src="https://github.com/user-attachments/assets/0da31eab-26fc-4db4-82ce-569049a5abad" />

```

## Threat Intelligence

```md id="8jlwm7"
<img width="1858" height="919" alt="Screenshot 2026-05-27 124352" src="https://github.com/user-attachments/assets/040eab5d-6eeb-44b2-ae05-c39921bcd75a" />

```

## Network Monitoring

```md id="jlwmf9"
<img width="1800" height="899" alt="Screenshot 2026-05-27 132748" src="https://github.com/user-attachments/assets/1989891f-5587-4daf-b5de-cccc81a028a7" />

```

## Incident Correlation

```md id="jlwmv6"
<img width="1211" height="614" alt="Screenshot 2026-05-27 131042" src="https://github.com/user-attachments/assets/bc3d0088-b7c3-40a3-a65a-c2d478df821f" />

```

---

# Features

## Realtime Telemetry Streaming

* Live endpoint telemetry collection
* Realtime WebSocket streaming using Socket.IO
* Instant dashboard updates
* Multi-host monitoring

---

## Behavioral Detection Engine

ShadowOne detects suspicious endpoint activity including:

### Encoded PowerShell Detection

Detects:

```powershell id="4jlwm8"
powershell.exe -EncodedCommand ...
```

MITRE:

```text id="jlwmk4"
T1059.001 — PowerShell
```

---

### LOLBins Detection

Detects abuse of:

* certutil.exe
* mshta.exe
* rundll32.exe
* regsvr32.exe

MITRE:

```text id="jlwmc0"
T1218 — Signed Binary Proxy Execution
```

---

### Suspicious Process Chains

Detects:

```text id="yjlwm1"
cmd.exe → powershell.exe
```

MITRE:

```text id="0jlwm9"
T1059 — Command and Scripting Interpreter
```

---

# MITRE ATT&CK Mapping

ShadowOne maps detections to MITRE ATT&CK techniques for attack classification and threat analysis.

| Technique ID | Technique Name                    | Detection               |
| ------------ | --------------------------------- | ----------------------- |
| T1059.001    | PowerShell                        | Encoded PowerShell      |
| T1059        | Command and Scripting Interpreter | CMD spawning PowerShell |
| T1218        | Signed Binary Proxy Execution     | LOLBins abuse           |

---

# Threat Correlation Engine

ShadowOne correlates suspicious telemetry into attack incidents.

Instead of isolated alerts:

```text id="7jlwm8"
PowerShell detected
```

ShadowOne builds attack chains:

```text id="9jlwm6"
cmd.exe
   ↓
powershell.exe
   ↓
network activity
```

This simulates modern EDR investigation workflows.

---

# Network Monitoring

Realtime monitoring of:

* outbound connections
* remote IPs
* ports
* process-based network activity

The platform filters localhost noise and displays meaningful external traffic.

---

# Threat Scoring

Dynamic threat scoring based on:

* severity
* suspicious behavior
* process execution chains

| Severity | Score |
| -------- | ----- |
| Critical | 100   |
| High     | 70    |
| Medium   | 40    |

Additional suspicious behavior increases threat score dynamically.

---

# SOC Dashboard

Interactive React dashboard includes:

* Dashboard Overview
* Threat Intelligence
* Telemetry Stream
* Host Monitoring
* Incident Correlation
* Network Monitoring

---

# Architecture

```text id="djlwm2"
Endpoint Agent
      ↓
Telemetry Collection
      ↓
FastAPI Backend
      ↓
Detection Engine
      ↓
Threat Correlation Engine
      ↓
MongoDB Storage
      ↓
Socket.IO Realtime Stream
      ↓
React SOC Dashboard
```

---

# Tech Stack

## Backend

* Python
* FastAPI
* Socket.IO
* PyMongo
* psutil

## Frontend

* React
* Axios
* Socket.IO Client

## Database

* MongoDB

---

# Project Structure

```text id="jlwma1"
shadowone-edr/
│
├── backend/
│   ├── main.py
│
├── agent/
│   ├── agent.py
│
├── dashboard/
│   ├── src/
│   │   ├── App.js
│   │   ├── styles.css
│
└── README.md
```

---

# Installation

## Clone Repository

```bash id="wjlwm0"
git clone https://github.com/yourusername/shadowone-edr.git

cd shadowone-edr
```

---

# Backend Setup

## Install Dependencies

```bash id="jlwmx6"
cd backend

pip install fastapi uvicorn pymongo python-socketio psutil
```

## Start Backend

```bash id="hjlwm7"
python main.py
```

Backend runs on:

```text id="0jlwm4"
http://127.0.0.1:8000
```

---

# MongoDB Setup

Install MongoDB locally.

Default connection:

```text id="jlwmm5"
mongodb://localhost:27017/
```

Database:

```text id="6jlwm2"
shadowone
```

Collections:

* telemetry
* incidents

---

# Agent Setup

## Install Dependencies

```bash id="xjlwm2"
cd agent

pip install psutil requests
```

## Run Agent

```bash id="rjlwm7"
python agent.py
```

The endpoint agent continuously:

* monitors processes
* collects telemetry
* sends data to backend

---

# Frontend Setup

## Install Dependencies

```bash id="vjlwm2"
cd dashboard

npm install
```

## Start Frontend

```bash id="9jlwm3"
npm start
```

Frontend runs on:

```text id="4jlwm2"
http://localhost:3000
```

---

# Detection Examples

## Encoded PowerShell

```powershell id="jlwmn9"
powershell.exe -EncodedCommand UwB0AGEAcgB0AC0AUAByAG8AYwBlAHMAcwAgAGMAYQBsAGMALgBlAHgAZQA=
```

Triggers:

* Encoded PowerShell Detection
* MITRE T1059.001
* Threat Incident Creation

---

## LOLBin Abuse

```powershell id="xjlwm3"
certutil.exe
```

Triggers:

* Suspicious LOLBin Execution
* MITRE T1218

---

## Network Monitoring Test

```powershell id="7jlwm1"
curl https://google.com
```

Creates outbound traffic visible in:

* Network Monitoring page

---

# Current Capabilities

* Realtime telemetry streaming
* Behavioral detections
* MITRE ATT&CK mapping
* Threat scoring
* Multi-host monitoring
* Incident correlation
* Network monitoring
* Attack chain visibility
* WebSocket event streaming
* SOC dashboard

---

# Roadmap

## Planned Features

* Process Tree Visualization
* Sigma Rule Engine
* Threat Hunting Queries
* File Integrity Monitoring
* Process Termination Actions
* Endpoint Isolation
* Persistence Detection
* Docker Deployment
* Authentication & RBAC
* Elasticsearch Integration
* Threat Timeline Reconstruction

---

# Why ShadowOne?

Most beginner cybersecurity projects stop at:

* static dashboards
* log viewers
* simple alerts

ShadowOne focuses on:

* behavioral detection engineering
* realtime telemetry analytics
* incident correlation
* attack visibility
* SOC investigation workflows

The goal is to simulate core concepts used in modern EDR/XDR platforms.

---

# Disclaimer

ShadowOne is built for:

* educational purposes
* cybersecurity learning
* detection engineering practice
* defensive security research

Do not use this project for unauthorized or malicious activities.

---

# Author

Mohit Kumar

Cybersecurity | Detection Engineering | SOC Automation | Backend Security

GitHub:

```text id="jlwmm6"
https://github.com/Mohitkumar1322
```

LinkedIn:

```text id="0jlwm3"
https://linkedin.com/in/mohitkum13
```
