"""
Chat Parser Service

Parses plain text Claude chat exports into Q&A session pairs.
Handles multiple formats:
1. "Human: ... Assistant: ..." markers
2. Plain text copied from Claude (questions ending with ?)
"""

import re
from dataclasses import dataclass


@dataclass
class ParsedSession:
    """Represents a single Q&A pair"""
    order: int
    question: str
    answer: str


def parse_chat(content: str) -> list[ParsedSession]:
    """
    Parse a Claude chat export into Q&A sessions.

    Args:
        content: Raw chat text (copy-pasted from Claude)

    Returns:
        List of ParsedSession objects
    """
    # Normalize line endings
    content = content.replace('\r\n', '\n').replace('\r', '\n')

    # Try format 1: Human/Assistant markers
    sessions = _parse_with_markers(content)
    if sessions:
        return sessions

    # Try format 2: Plain text (detect questions by ? and paragraph structure)
    sessions = _parse_plain_text(content)
    if sessions:
        return sessions

    # Fallback: Simple paragraph pairing
    return _parse_fallback(content)


def _parse_with_markers(content: str) -> list[ParsedSession]:
    """Parse chat with Human:/Assistant: markers."""
    sessions = []

    # Pattern to find Human/User messages
    human_pattern = re.compile(
        r'(?:Human|User|H)\s*:\s*(.*?)(?=(?:Assistant|Claude|A)\s*:|$)',
        re.DOTALL | re.IGNORECASE
    )
    assistant_pattern = re.compile(
        r'(?:Assistant|Claude|A)\s*:\s*(.*?)(?=(?:Human|User|H)\s*:|$)',
        re.DOTALL | re.IGNORECASE
    )

    human_matches = list(human_pattern.finditer(content))
    assistant_matches = list(assistant_pattern.finditer(content))

    if not human_matches:
        return []

    order = 1
    for h_match in human_matches:
        question = h_match.group(1).strip()

        # Find the assistant response after this human message
        answer = ""
        for a_match in assistant_matches:
            if a_match.start() >= h_match.start():
                answer = a_match.group(1).strip()
                break

        if question:
            sessions.append(ParsedSession(order=order, question=question, answer=answer))
            order += 1

    return sessions


def _parse_plain_text(content: str) -> list[ParsedSession]:
    """
    Parse plain text chat (copied from Claude web interface).

    Strategy: Find short lines ending with ? as questions,
    but only if they're followed by substantial answer content.
    """
    sessions = []

    # Split into paragraphs (separated by blank lines)
    paragraphs = re.split(r'\n\s*\n+', content.strip())
    paragraphs = [p.strip() for p in paragraphs if p.strip()]

    if not paragraphs:
        return []

    # Find questions: short paragraphs that are followed by longer content
    question_indices = []

    for i, para in enumerate(paragraphs):
        # Check if this looks like a user question
        if _is_likely_user_question(para, paragraphs, i):
            question_indices.append(i)

    if not question_indices:
        return []

    # Build sessions: each question + all following paragraphs until next question
    order = 1
    for idx, q_idx in enumerate(question_indices):
        question = paragraphs[q_idx]

        # Answer is everything from after this question until next question (or end)
        if idx + 1 < len(question_indices):
            next_q_idx = question_indices[idx + 1]
        else:
            next_q_idx = len(paragraphs)

        # Collect answer paragraphs
        answer_paragraphs = paragraphs[q_idx + 1:next_q_idx]
        answer = '\n\n'.join(answer_paragraphs)

        if question and answer:
            sessions.append(ParsedSession(order=order, question=question, answer=answer))
            order += 1

    return sessions


def _is_likely_user_question(text: str, all_paragraphs: list, current_index: int) -> bool:
    """
    Determine if a paragraph is likely a USER's question (not Claude's follow-up).

    Key insight: User questions are followed by LONG answers.
    Claude's follow-up questions ("Does this make sense?") are at the END of answers,
    followed by the next user question (short) or nothing.
    """
    text = text.strip()

    # Count lines and length
    lines = text.split('\n')
    line_count = len(lines)
    char_count = len(text)

    # Must be relatively short to be a question
    if char_count > 500 or line_count > 5:
        return False

    # Check what comes AFTER this paragraph
    if current_index + 1 < len(all_paragraphs):
        next_para = all_paragraphs[current_index + 1]
        next_len = len(next_para)

        # If followed by a LONG paragraph (answer), this is likely a user question
        # If followed by a SHORT paragraph, this might be Claude's follow-up question

        # User question → Long answer (500+ chars typically)
        # Claude follow-up → Next user question (short) or end

        if next_len > 300:  # Followed by substantial content = likely user question
            # Additional checks for question-like structure
            if _looks_like_question(text):
                return True
    else:
        # Last paragraph - not a question (questions need answers)
        return False

    return False


def _looks_like_question(text: str) -> bool:
    """Check if text has question-like characteristics."""
    text = text.strip()
    text_lower = text.lower()

    # Ends with question mark
    if text.endswith('?'):
        return True

    # Starts with question words or imperatives
    question_starters = [
        'what ', 'how ', 'why ', 'when ', 'where ', 'which ', 'who ',
        'is ', 'are ', 'can ', 'could ', 'do ', 'does ', 'did ',
        'tell me', 'explain', 'show me', 'describe', 'help me',
        'i want', "i'd like", 'please', 'give me'
    ]

    if any(text_lower.startswith(starter) for starter in question_starters):
        return True

    # Very short statements (likely questions/requests)
    if len(text) < 100:
        return True

    return False


def _parse_fallback(content: str) -> list[ParsedSession]:
    """Fallback: pair consecutive paragraphs as Q&A."""
    sessions = []

    paragraphs = re.split(r'\n\s*\n+', content.strip())
    paragraphs = [p.strip() for p in paragraphs if p.strip()]

    order = 1
    i = 0
    while i < len(paragraphs) - 1:
        question = paragraphs[i]
        answer = paragraphs[i + 1]

        if question and answer:
            sessions.append(ParsedSession(order=order, question=question, answer=answer))
            order += 1
            i += 2
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
