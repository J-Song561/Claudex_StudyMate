"""
Chat Parser Service

Parses plain text Claude chat exports into Q&A session pairs.
Handles the format where messages are prefixed with "Human:" and "Assistant:".
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

    Supports formats:
    - "Human: ... Assistant: ..."
    - "H: ... A: ..."
    - Lines starting with user/assistant markers

    Args:
        content: Raw chat text (copy-pasted from Claude)

    Returns:
        List of ParsedSession objects
    """
    sessions = []

    # Normalize line endings
    content = content.replace('\r\n', '\n').replace('\r', '\n')

    # Pattern to split on Human/Assistant markers
    # Handles: "Human:", "Human :", "H:", "User:", etc.
    pattern = r'\n(?=(?:Human|H|User)\s*:)|(?=(?:Human|H|User)\s*:)'

    # First, let's try to find all Human/Assistant pairs
    # More robust pattern that captures the role and content
    message_pattern = re.compile(
        r'(Human|H|User)\s*:\s*(.*?)(?=(?:Assistant|A|Claude)\s*:|$)',
        re.DOTALL | re.IGNORECASE
    )
    assistant_pattern = re.compile(
        r'(Assistant|A|Claude)\s*:\s*(.*?)(?=(?:Human|H|User)\s*:|$)',
        re.DOTALL | re.IGNORECASE
    )

    # Find all human messages with their positions
    human_matches = list(message_pattern.finditer(content))
    assistant_matches = list(assistant_pattern.finditer(content))

    if not human_matches:
        # Try alternative parsing: look for conversation blocks
        return _parse_alternative_format(content)

    # Pair up human and assistant messages
    order = 1
    for h_match in human_matches:
        question = h_match.group(2).strip()
        h_end = h_match.end()

        # Find the assistant response that comes after this human message
        answer = ""
        for a_match in assistant_matches:
            if a_match.start() >= h_match.start():
                answer = a_match.group(2).strip()
                break

        if question:  # Only add if there's actual content
            sessions.append(ParsedSession(
                order=order,
                question=question,
                answer=answer
            ))
            order += 1

    return sessions


def _parse_alternative_format(content: str) -> list[ParsedSession]:
    """
    Fallback parser for non-standard formats.

    Attempts to split content into logical chunks based on:
    - Double newlines (paragraph breaks)
    - Question marks followed by responses
    """
    sessions = []

    # Split by double newlines to find potential Q&A blocks
    blocks = re.split(r'\n\s*\n', content)

    # Try to pair consecutive blocks as Q&A
    order = 1
    i = 0
    while i < len(blocks) - 1:
        question = blocks[i].strip()
        answer = blocks[i + 1].strip()

        if question and answer:
            sessions.append(ParsedSession(
                order=order,
                question=question,
                answer=answer
            ))
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
