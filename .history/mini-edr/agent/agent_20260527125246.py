import psutil
import requests
import socket
import time

BACKEND_URL = "http://127.0.0.1:8000/telemetry"

hostname = socket.gethostname()

while True:

    for proc in psutil.process_iter([
        'pid',
        'name',
        'cmdline'
    ]):

        try:

            parent_pid = proc.ppid()

            try:
                parent_name = psutil.Process(parent_pid).name()
            except:
                parent_name = "Unknown"

            telemetry = {

                "hostname": hostname,

                "pid": proc.info['pid'],

                "ppid": parent_pid,

                "process_name": proc.info['name'],

                "parent_process": parent_name,

                "cmdline": " ".join(proc.info['cmdline']) if proc.info['cmdline'] else ""
            }

            requests.post(
                BACKEND_URL,
                json=telemetry
            )

            print(telemetry)

        except Exception as e:
            print(e)

    time.sleep(5)