from fastapi import FastAPI, HTTPException
import subprocess

app = FastAPI()
TOKEN = "123"

@app.get("/hook")
def trigger(token: str):
    if token != TOKEN:
        raise HTTPException(status_code=403)

    subprocess.run(["bash", "maintenance.sh"])  
    return {"status": "done"}
