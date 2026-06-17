from pydantic import BaseModel
from typing import Any, List

class MistakeBankItem(BaseModel):
    id: int
    test_id: str
    total_score: int
    created_at: str
    detailed_results: List[Any]

class MistakeBankResponse(BaseModel):
    status: str
    data: List[MistakeBankItem]

class GradeResponse(BaseModel):
    status: str
    history_id: int
    question_index: int
    audio_url: str | None = None
    feedback: Any