import google.generativeai as genai
import json

def grade_writing_with_gemini(api_key: str, question: str, user_response: str):
    genai.configure(api_key=api_key)

    model = genai.GenerativeModel(
        'gemini-2.5-flash',
    )

    prompt = f"""
    You are a strict TOEIC Writing examiner.
    Question: {question}
    Candidate's response: {user_response}
    
    Evaluate the response based on Task Achievement, Grammar, and Lexical Resource.
    Score it out of 5.
    
    You MUST return ONLY a valid JSON object matching this exact schema:
    {{
        "total_score": int (from 0 to 5),
        "grammar_mistakes": [
            {{"original": "the wrong word or phrase", "corrected": "the correction"}}
        ],
        "suggested_vocab": ["advanced_word_1", "advanced_word_2", "advanced_word_3"]
    }}
    """
    
    response = model.generate_content(prompt)
    print("===== GEMINI RESPONSE =====")
    print(response.text)
    print("===========================")
    # Trả về dưới dạng Dictionary (FastAPI sẽ tự động convert sang JSON)
    text = response.text

    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

    return json.loads(text)