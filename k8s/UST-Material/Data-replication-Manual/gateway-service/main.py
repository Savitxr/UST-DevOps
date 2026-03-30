import os
import random
from typing import List, Optional

import pymysql
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel


app = FastAPI(title="mysql-rw-gateway", version="1.0.0")

WRITE_DB_HOST = os.getenv("WRITE_DB_HOST", "mysql-write")
READ_DB_HOSTS = [
    host.strip()
    for host in os.getenv("READ_DB_HOSTS", "mysql-read").split(",")
    if host.strip()
]
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_NAME = os.getenv("DB_NAME", "appdb")


class MessageIn(BaseModel):
    message: str


def _get_conn(host: str, database: Optional[str] = DB_NAME):
    kwargs = {
        "host": host,
        "port": DB_PORT,
        "user": DB_USER,
        "password": DB_PASSWORD,
        "autocommit": True,
        "cursorclass": pymysql.cursors.DictCursor,
    }
    if database:
        kwargs["database"] = database
    return pymysql.connect(**kwargs)


def _ensure_table() -> None:
    try:
        # Connect without selecting a DB first so startup works on a clean cluster.
        with _get_conn(WRITE_DB_HOST, database=None) as conn:
            with conn.cursor() as cur:
                cur.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}`")
                cur.execute(
                    f"""
                    CREATE TABLE IF NOT EXISTS `{DB_NAME}`.seed_data (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        message VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
    except Exception as exc:
        raise RuntimeError(f"failed to initialize table on write host {WRITE_DB_HOST}: {exc}")


@app.on_event("startup")
def on_startup() -> None:
    _ensure_table()


@app.get("/health")
def health():
    read_host = random.choice(READ_DB_HOSTS) if READ_DB_HOSTS else ""
    return {
        "status": "ok",
        "write_host": WRITE_DB_HOST,
        "read_hosts": READ_DB_HOSTS,
        "sample_read_host": read_host,
    }


@app.post("/messages")
def create_message(payload: MessageIn):
    try:
        with _get_conn(WRITE_DB_HOST) as conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO seed_data (message) VALUES (%s)", (payload.message,))
                new_id = cur.lastrowid
        return {"inserted_id": new_id, "written_to": WRITE_DB_HOST}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"write failed: {exc}")


@app.get("/messages")
def list_messages(limit: int = Query(default=10, ge=1, le=100)):
    if not READ_DB_HOSTS:
        raise HTTPException(status_code=500, detail="no read hosts configured")

    host = random.choice(READ_DB_HOSTS)
    try:
        with _get_conn(host) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, message, created_at FROM seed_data ORDER BY id DESC LIMIT %s",
                    (limit,),
                )
                rows: List[dict] = cur.fetchall()
        return {"read_from": host, "count": len(rows), "rows": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"read failed from {host}: {exc}")
