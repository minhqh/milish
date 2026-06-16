from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import writing, speaking 

app = FastAPI(title="Milish App", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(writing.router, prefix="/api/writing", tags=["Writing"])
app.include_router(speaking.router, prefix="/api/speaking", tags=["Speaking"])

@app.get("/")
async def root():
    return {"message": "Welcome to Milish API - Backend!"}

@app.get("/ping")
async def ping():
    return {"status": "alive", "service": "Milish API"}