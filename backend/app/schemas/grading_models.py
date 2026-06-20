from pydantic import BaseModel
from typing import List

# Cấu trúc lỗi ngữ pháp
class GrammarMistake(BaseModel):
    original: str
    corrected: str

# Cấu trúc trả về cho frontend
class GradingResult(BaseModel):
    total_score: int
    grammar_mistakes: List[GrammarMistake]
    suggested_vocab: List[str]

# Cấu trúc dữ liệu Frontend gửi lên
class WritingRequest(BaseModel):
    api_key: str
    question: str
    user_response: str
    test_id: str
    question_index: int

class GradeRequest(BaseModel):
    api_key: str