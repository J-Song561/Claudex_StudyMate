"""
Chat Parser Service

Parses chat exports into Q&A session pairs.
Supports:
1. JSON format from browser scraper (most accurate)
2. AI-powered parsing with Gemini
3. Heuristic fallback parsing
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


@dataclass
class ParseResult:
    """Result of parsing including metadata"""
    sessions: list[ParsedSession]
    title: str
    platform: str


def parse_chat(content: str) -> list[ParsedSession]:
    """
    Parse a chat export into Q&A sessions.

    Tries in order:
    1. JSON format (from browser scraper) - most accurate
    2. AI-powered parsing with Gemini
    3. Heuristic fallback parsing

    Args:
        content: Chat content (JSON or plain text)

    Returns:
        List of ParsedSession objects
    """
    content = content.strip()

    # Try JSON format first (from scraper)
    result = _parse_json_format(content)
    if result:
        return result.sessions

    # Normalize line endings for text parsing
    content = content.replace('\r\n', '\n').replace('\r', '\n')

    # Try AI-powered parsing
    sessions = _parse_with_ai(content)
    if sessions:
        return sessions

    # Fallback to heuristic parsing
    return _parse_fallback(content)


def parse_chat_with_metadata(content: str) -> ParseResult:
    """
    Parse chat and return metadata (title, platform) if available.

    Args:
        content: Chat content (JSON or plain text)

    Returns:
        ParseResult with sessions, title, and platform
    """
    content = content.strip()

    # Try JSON format first
    result = _parse_json_format(content)
    if result:
        return result

    # Fallback to regular parsing
    content = content.replace('\r\n', '\n').replace('\r', '\n')

    sessions = _parse_with_ai(content)
    if not sessions:
        sessions = _parse_fallback(content)

    return ParseResult(
        sessions=sessions,
        title='',
        platform='unknown'
    )


def _parse_json_format(content: str) -> ParseResult | None:
    """
    Parse JSON format from browser scraper.

    Expected format:
    {
        "title": "Chat Title",
        "platform": "claude|chatgpt|gemini",
        "sessions": [
            {"question": "...", "answer": "..."},
            ...
        ]
    }
    """
    # Quick check if it looks like JSON
    if not (content.startswith('{') or content.startswith('[')):
        return None

    try:
        data = json.loads(content)

        # Handle direct array of sessions
        if isinstance(data, list):
            sessions = []
            for i, item in enumerate(data, 1):
                question = item.get('question', '').strip()
                answer = item.get('answer', '').strip()
                if question and answer:
                    sessions.append(ParsedSession(order=i, question=question, answer=answer))

            return ParseResult(sessions=sessions, title='', platform='unknown')

        # Handle object with metadata
        if isinstance(data, dict):
            title = data.get('title', '')
            platform = data.get('platform', 'unknown')
            raw_sessions = data.get('sessions', [])

            sessions = []
            for i, item in enumerate(raw_sessions, 1):
                question = item.get('question', '').strip()
                answer = item.get('answer', '').strip()
                if question and answer:
                    sessions.append(ParsedSession(order=i, question=question, answer=answer))

            if sessions:
                return ParseResult(sessions=sessions, title=title, platform=platform)

    except json.JSONDecodeError:
        pass

    return None


def _parse_with_ai(content: str) -> list[ParsedSession]:
    """Use Gemini to intelligently parse the chat into Q&A pairs."""
    import google.generativeai as genai

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        return []

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Truncate very long chats
        max_chars = 100000
        if len(content) > max_chars:
            content = content[:max_chars] + "\n\n[... content truncated ...]"

        prompt = f"""You are a chat parser. Analyze this conversation between a user and an AI assistant.

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

        # Clean up markdown code blocks
        if response_text.startswith('```'):
            response_text = re.sub(r'^```(?:json)?\n?', '', response_text)
            response_text = re.sub(r'\n?```$', '', response_text)

        qa_pairs = json.loads(response_text)

        sessions = []
        for i, pair in enumerate(qa_pairs, 1):
            question = pair.get('question', '').strip()
            answer = pair.get('answer', '').strip()
            if question and answer:
                sessions.append(ParsedSession(order=i, question=question, answer=answer))

        return sessions

    except Exception as e:
        print(f"AI parsing failed: {e}")
        return []


def _parse_fallback(content: str) -> list[ParsedSession]:
    """Fallback heuristic parser."""
    sessions = []

    paragraphs = re.split(r'\n\s*\n+', content.strip())
    paragraphs = [p.strip() for p in paragraphs if p.strip()]

    order = 1
    i = 0
    while i < len(paragraphs) - 1:
        current = paragraphs[i]
        next_para = paragraphs[i + 1]

        if len(current) < 500 and len(next_para) > 200:
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
    """Validate parsed sessions."""
    if not sessions:
        return False, "No Q&A sessions found. Please check the format or try using the browser scraper."

    empty_questions = sum(1 for s in sessions if not s.question)

    if empty_questions == len(sessions):
        return False, "All questions are empty. Please check the format."

    return True, ""
