from pydantic import BaseModel
from typing import List, Optional

class GenerateTestRequest(BaseModel):
    skills: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    question_count: int = 5

class QuestionAnswer(BaseModel):
    question_id: str
    order_idx: int
    skill: str
    answer_text: Optional[str] = None  
    audio_base64: Optional[str] = None

class TestSubmitRequest(BaseModel):
    test_id: str
    answers: List[QuestionAnswer]