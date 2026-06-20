import google.generativeai as genai
import json

class GeminiService:
    def __init__(self, api_key: str):
        # Setup key ngay khi khởi tạo
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def _parse_json(self, response_text: str) -> dict:
        """Hàm dùng chung để dọn dẹp rác Markdown và ép kiểu JSON"""
        text = response_text.replace("```json", "").replace("```", "").strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"error": "Lỗi phân tích cú pháp từ AI", "raw_text": text}

    def grade_writing(self, question: str, user_response: str) -> dict:
        prompt = f"""
        You are a strict TOEIC Writing examiner.
        Question: {question}
        Candidate's response: {user_response}
        
        Evaluate the response based on Task Achievement, Grammar, and Lexical Resource. Score it out of 5.
        You MUST return ONLY a valid JSON object matching this exact schema:
        {{
            "total_score": int (from 0 to 5),
            "grammar_mistakes": [{{"original": "wrong", "corrected": "right"}}],
            "suggested_vocab": ["word1", "word2"],
            "note": "brief feedback"
        }}
        """
        response = self.model.generate_content(prompt)
        return self._parse_json(response.text)

    def grade_speaking(self, question: str, audio_bytes: bytes, mime_type: str = "audio/webm") -> dict:
        prompt = f"""
        You are a strict TOEIC Speaking examiner.
        Question/Context: {question}
        
        Listen to the audio. Evaluate Pronunciation, Intonation, Grammar, and Vocabulary. Score it out of 5.
        You MUST return ONLY a valid JSON object matching this exact schema:
        {{
            "total_score": int (from 0 to 5),
            "grammar_mistakes": [{{"original": "wrong sound", "corrected": "right sound"}}],
            "suggested_vocab": ["word1", "word2"],
            "note": "brief feedback"
        }}
        """
        response = self.model.generate_content([
            {"mime_type": mime_type, "data": audio_bytes},
            prompt
        ])
        return self._parse_json(response.text)