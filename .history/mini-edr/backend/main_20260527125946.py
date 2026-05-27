from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

import socketio
import uvicorn
import psutil
import time

# =========================
# SOCKET.IO
# =========================

sio = socketio.AsyncServer(

    async_mode="asgi",

    cors_allowed_origins="*"

)

# =========================
# FASTAPI
# =========================

fastapi_app = FastAPI()

fastapi_app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)

# =========================
# DATABASE
# =========================

client = MongoClient(
    "mongodb://localhost:27017/"
)

db = client["shadowone"]

telemetry_collection = db["telemetry"]

incident_collection = db["incidents"]

# =========================
# DETECTION ENGINE
# =========================

def detect_suspicious(process, parent, cmdline):

    process = process.lower()

    parent = parent.lower()

    cmdline = cmdline.lower()

    # Encoded PowerShell

    if "powershell" in process and "-enc" in cmdline:

        return {

            "alert": "Encoded PowerShell",

            "severity": "high",

            "mitre": "T1059.001"

        }

    # CMD spawning PowerShell

    if "cmd.exe" in parent and "powershell.exe" in process:

        return {

            "alert": "CMD Spawned PowerShell",

            "severity": "medium",

            "mitre": "T1059"

        }

    # LOLBins

    lolbins = [

        "certutil.exe",

        "mshta.exe",

        "rundll32.exe",

        "regsvr32.exe"

    ]

    if process in lolbins:

        return {

            "alert": "Suspicious LOLBin Execution",

            "severity": "high",

            "mitre": "T1218"

        }

    return None

# =========================
# THREAT SCORE
# =========================

def calculate_threat_score(data):

    score = 0

    severity = data.get("severity")

    if severity == "critical":
        score += 100

    elif severity == "high":
        score += 70

    elif severity == "medium":
        score += 40

    process = data.get("process_name", "").lower()

    if "powershell" in process:
        score += 20

    if "cmd.exe" in process:
        score += 10

    return score

# =========================
# NETWORK CONNECTIONS
# =========================

def get_network_connections():

    connections = []

    try:

        for conn in psutil.net_connections():

            try:

                if conn.raddr:

                    connections.append({

                        "local_ip": conn.laddr.ip,

                        "local_port": conn.laddr.port,

                        "remote_ip": conn.raddr.ip,

                        "remote_port": conn.raddr.port,

                        "status": conn.status

                    })

            except:
                pass

    except:
        pass

    return connections

# =========================
# INCIDENT CORRELATION
# =========================

def create_incident(data):

    process = data.get("process_name", "")

    parent = data.get("parent_process", "")

    incident = {

        "timestamp": time.time(),

        "hostname": data.get("hostname"),

        "attack_chain": [

            parent,

            process

        ],

        "severity": data.get("severity"),

        "mitre": data.get("mitre"),

        "threat_score": data.get("threat_score")

    }

    incident_collection.insert_one(
        incident.copy()
    )

    return incident

# =========================
# ROUTES
# =========================

@fastapi_app.get("/")
def home():

    return {

        "message": "ShadowOne Running"

    }

# =========================
# GET TELEMETRY
# =========================

@fastapi_app.get("/telemetry")
def get_telemetry():

    data = list(

        telemetry_collection.find(
            {},
            {"_id": 0}
        )

    )

    return data

# =========================
# GET INCIDENTS
# =========================

@fastapi_app.get("/incidents")
def get_incidents():

    incidents = list(

        incident_collection.find(
            {},
            {"_id": 0}
        )

    )

    return incidents

# =========================
# NETWORK MONITORING
# =========================

@fastapi_app.get("/network")
def network_data():

    return get_network_connections()

# =========================
# RECEIVE TELEMETRY
# =========================

@fastapi_app.post("/telemetry")
async def receive_telemetry(data: dict):

    detection = detect_suspicious(

        data.get("process_name", ""),

        data.get("parent_process", ""),

        data.get("cmdline", "")

    )

    if detection:

        data["alert"] = detection["alert"]

        data["severity"] = detection["severity"]

        data["mitre"] = detection["mitre"]

    # THREAT SCORE

    data["threat_score"] = calculate_threat_score(data)

    # STORE TELEMETRY

    telemetry_collection.insert_one(
        data.copy()
    )

    # CREATE INCIDENT

    if data.get("alert"):

        incident = create_incident(data)

        await sio.emit(

            "new_incident",

            incident

        )

    # REALTIME TELEMETRY

    await sio.emit(

        "new_event",

        data

    )

    return {

        "status": "received"

    }

# =========================
# SOCKET APP
# =========================

app = socketio.ASGIApp(

    sio,

    fastapi_app

)

# =========================
# MAIN
# =========================

if __name__ == "__main__":

    uvicorn.run(

        app,

        host="0.0.0.0",

        port=8000

    )