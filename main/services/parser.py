"""
Chat Parser Service

Parses plain text Claude chat exports into Q&A session pairs.
Uses Gemini AI for intelligent parsing.
"""

import os
import re
import json
from dataclasses import dataclass


@dataclass
class ParsedSession:
    """Represents a single Q&A pair"""
    order: int
    question: str
    answer: str


def parse_chat(content: str) -> list[ParsedSession]:
    """
    Parse a Claude chat export into Q&A sessions using Gemini AI.

    Args:
        content: Raw chat text (copy-pasted from Claude)

    Returns:
        List of ParsedSession objects
    """
    # Normalize line endings
    content = content.replace('\r\n', '\n').replace('\r', '\n')

    # Try AI-powered parsing first
    sessions = _parse_with_ai(content)
    if sessions:
        return sessions

    # Fallback to simple heuristic parsing
    return _parse_fallback(content)


def _parse_with_ai(content: str) -> list[ParsedSession]:
    """Use Gemini to intelligently parse the chat into Q&A pairs."""
    import google.generativeai as genai

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        return []  # Fall back to heuristic parsing

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Truncate very long chats to avoid token limits
        max_chars = 100000  # ~25k tokens
        if len(content) > max_chars:
            content = content[:max_chars] + "\n\n[... content truncated ...]"

        prompt = f"""You are a chat parser. Analyze this conversation between a user and an AI assistant (Claude).

Split it into Question-Answer pairs where:
- "question" = what the USER asked or said
- "answer" = what the AI ASSISTANT responded

IMPORTANT RULES:
1. User messages are typically SHORT (questions, requests, comments)
2. Assistant messages are typically LONG (explanations, with bullet points, code, examples)
3. Don't confuse the assistant's follow-up questions (like "Does this make sense?") as user questions
4. Each Q&A pair should be one exchange (user asks → assistant answers)

Return ONLY valid JSON array, no other text:
[
  {{"question": "user's first question", "answer": "assistant's first response"}},
  {{"question": "user's second question", "answer": "assistant's second response"}}
]

Here is the conversation to parse:

{content}"""

        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean up response - remove markdown code blocks if present
        if response_text.startswith('```'):
            response_text = re.sub(r'^```(?:json)?\n?', '', response_text)
            response_text = re.sub(r'\n?```$', '', response_text)

        # Parse JSON
        qa_pairs = json.loads(response_text)

        # Convert to ParsedSession objects
        sessions = []
        for i, pair in enumerate(qa_pairs, 1):
            question = pair.get('question', '').strip()
            answer = pair.get('answer', '').strip()
            if question and answer:
                sessions.append(ParsedSession(
                    order=i,
                    question=question,
                    answer=answer
                ))

        return sessions

    except Exception as e:
        print(f"AI parsing failed: {e}")
        return []  # Fall back to heuristic parsing


def _parse_fallback(content: str) -> list[ParsedSession]:
    """Fallback heuristic parser when AI parsing fails."""
    sessions = []

    # Split into paragraphs
    paragraphs = re.split(r'\n\s*\n+', content.strip())
    paragraphs = [p.strip() for p in paragraphs if p.strip()]

    # Simple alternating pattern: short, long, short, long...
    order = 1
    i = 0
    while i < len(paragraphs) - 1:
        current = paragraphs[i]
        next_para = paragraphs[i + 1]

        # If current is short and next is long, treat as Q&A
        if len(current) < 500 and len(next_para) > 200:
            # Collect all "answer" paragraphs until next short one
            answer_parts = [next_para]
            j = i + 2
            while j < len(paragraphs) and len(paragraphs[j]) > 300:
                answer_parts.append(paragraphs[j])
                j += 1

            sessions.append(ParsedSession(
                order=order,
                question=current,
                answer='\n\n'.join(answer_parts)
            ))
            order += 1
            i = j
        else:
            i += 1

    return sessions


def validate_parsed_sessions(sessions: list[ParsedSession]) -> tuple[bool, str]:
    """
    Validate parsed sessions.

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not sessions:
        return False, "No Q&A sessions found in the chat. Please check the format."

    empty_questions = sum(1 for s in sessions if not s.question)
    empty_answers = sum(1 for s in sessions if not s.answer)

    if empty_questions == len(sessions):
        return False, "All questions are empty. Please check the chat format."

    return True, ""
