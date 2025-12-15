"""
Google Gemini API Labeling Service

Uses Gemini API to generate concise topic labels for Q&A sessions.
"""

import os
import time


def get_client():
    """Configure and return Gemini client."""
    import google.generativeai as genai
    from pathlib import Path
    from dotenv import load_dotenv
    
    # Load environment variables from gemini_api_key.env
    # Adjust the path based on your project structure
    env_path = Path(__file__).resolve().parent.parent.parent / 'env' / 'gemini_api_key.env'
    load_dotenv(env_path)

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError(
            "GOOGLE_API_KEY environment variable is not set. "
            "Please set it in your env/gemini_api_key.env file."
        )
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.5-flash-lite')

def generate_label(question: str, answer: str) -> str:
    """
    Generate a topic label for a Q&A session using Gemini.
    """
    try:
        model = get_client()
        
        # Truncate very long content to save tokens
        max_q_len = 500
        max_a_len = 1000
        q_truncated = question[:max_q_len] + "..." if len(question) > max_q_len else question
        a_truncated = answer[:max_a_len] + "..." if len(answer) > max_a_len else answer
        
        prompt = f"""You are a helpful assistant that creates concise topic labels for educational Q&A sessions.

Your task: Read the question and answer below, then create a SHORT topic label (2-6 words maximum) that captures the main concept.

Question: {q_truncated}

Answer: {a_truncated}

Instructions:
- Create a label that describes the TOPIC, not the question structure
- Use 2-6 words maximum
- Be specific and descriptive
- Use title case
- Do NOT include quotes or punctuation
- Output ONLY the label, nothing else

Examples: "Deep Learning vs Machine Learning" | "Neural Network Architectures" | "Loss Functions in ML"

Label:"""
        
        print(f"🔍 Calling Gemini API for question: {question[:50]}...")
        response = model.generate_content(prompt)
        label = response.text.strip()
        print(f"✅ Gemini returned: '{label}'")
        
        # Clean up the label
        label = label.strip('"\'.,!?')
        
        # Remove common prefixes
        for prefix in ['label:', 'topic:', 'title:']:
            if label.lower().startswith(prefix):
                label = label[len(prefix):].strip()
        
        # Limit label length
        if len(label) > 100:
            label = label[:100]
        
        # Add delay to respect rate limits (5 requests per minute = 12 seconds between requests)
        print("⏳ Waiting 13 seconds to respect rate limits...")
        time.sleep(13)
        
        return label
    
    except Exception as e:
        # Log the error for debugging
        print(f"❌ Labeling error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        
        # If it's a rate limit error, wait and retry once
        if "ResourceExhausted" in str(e) or "429" in str(e):
            print("⏳ Rate limit hit, waiting 20 seconds before retry...")
            time.sleep(20)
            try:
                model = get_client()
                response = model.generate_content(prompt)
                label = response.text.strip().strip('"\'.,!?')
                time.sleep(13)  # Wait again after successful retry
                return label
            except:
                pass
        
        # Return a fallback label on error
        return "Session (labeling failed)"


def generate_labels_batch(sessions: list[dict]) -> list[str]:
    """
    Generate labels for multiple sessions.

    Args:
        sessions: List of dicts with 'question' and 'answer' keys

    Returns:
        Labels for each session in order
    """
    labels = []
    for session in sessions:
        label = generate_label(session['question'], session['answer'])
        labels.append(label)
    return labels