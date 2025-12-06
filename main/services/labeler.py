"""
Google Gemini API Labeling Service

Uses Gemini API to generate concise topic labels for Q&A sessions.
"""

import os


def get_client():
    """Configure and return Gemini client."""
    import google.generativeai as genai

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError(
            "GOOGLE_API_KEY environment variable is not set. "
            "Please set it in your .env file or environment."
        )
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-1.5-flash')


def generate_label(question: str, answer: str) -> str:
    """
    Generate a topic label for a Q&A session using Gemini.

    Args:
        question: The user's question
        answer: The AI's answer

    Returns:
        A concise topic label (2-5 words)
    """
    model = get_client()

    # Truncate very long content to save tokens
    max_q_len = 500
    max_a_len = 1000

    q_truncated = question[:max_q_len] + "..." if len(question) > max_q_len else question
    a_truncated = answer[:max_a_len] + "..." if len(answer) > max_a_len else answer

    prompt = f"""Given this Q&A from a study session, provide a concise topic label (2-5 words).
The label should capture the main subject or concept being discussed.

Question: {q_truncated}

Answer (excerpt): {a_truncated}

Return ONLY the label, nothing else. No quotes, no explanation.
Examples of good labels: Attention Mechanism, Python List Comprehension, React Hooks vs State, Binary Search Algorithm, CSS Flexbox Layout

Label:"""

    try:
        response = model.generate_content(prompt)
        label = response.text.strip()

        # Clean up the label - remove quotes if present
        label = label.strip('"\'')

        # Limit label length
        if len(label) > 100:
            label = label[:100]

        return label

    except Exception as e:
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
