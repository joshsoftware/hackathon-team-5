from typing import Union

from fastapi import FastAPI, UploadFile, File
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

app = FastAPI()

origins = [
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


# @app.get("/items/{item_id}")
# def read_item(item_id: int, q: Union[str, None] = None):
#     return {"item_id": item_id, "q": q}


BASE_DIR = Path("./.tmp/images")


@app.post("/save_file")
async def save_file(file: UploadFile = File(...)):
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    file_save_path = BASE_DIR / file.filename

    with open(file_save_path, "wb") as f:
        f.write(file.file.read())

    return {"status": "file saved"}


@app.post("/process_log_file")
async def process_log_file(logs: str = ""):
    return {"OK"}