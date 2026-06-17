from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import writing, speaking, history_router, auth, test_router

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
app.include_router(history_router.router, prefix="/api", tags=["History"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(test_router.router, prefix="/api/tests", tags=["Tests"])

@app.get("/")
async def root():
    return {"message": "Welcome to Milish API - Backend!"}

@app.get("/ping")
async def ping():
    return {"status": "alive", "service": "Milish API"}