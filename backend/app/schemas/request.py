from pydantic import BaseModel
from typing import List, Optional

class GenerateTestRequest(BaseModel):
    skills: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    question_count: int = 5
