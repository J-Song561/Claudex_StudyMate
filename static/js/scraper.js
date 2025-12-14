/**
 * Claudex StudyMate - Chat Scraper
 *
 * Copy and paste this entire script into your browser console (F12 → Console)
 * while on a Claude, ChatGPT, or Gemini chat page.
 *
 * Supported platforms:
 * - claude.ai
 * - chat.openai.com / chatgpt.com
 * - gemini.google.com
 */

(function() {
    'use strict';

    // Detect which platform we're on
    function detectPlatform() {
        const host = window.location.host;
        if (host.includes('claude.ai')) return 'claude';
        if (host.includes('openai.com') || host.includes('chatgpt.com')) return 'chatgpt';
        if (host.includes('gemini.google.com')) return 'gemini';
        return 'unknown';
    }

    // Claude AI Parser
    function parseClaudeChat() {
        const messages = [];

        // Extract user messages
        const userElements = document.querySelectorAll('[data-testid="user-message"]');
        userElements.forEach((element, index) => {
            const contentElement = element.querySelector('p.whitespace-pre-wrap.break-words') ||
                                   element.querySelector('p') ||
                                   element;
            const content = contentElement?.textContent?.trim();
            if (content) {
                messages.push({
                    role: 'user',
                    content: content,
                    order: element.getBoundingClientRect().top
                });
            }
        });

        // Extract assistant messages
        const assistantElements = document.querySelectorAll('[data-is-streaming="false"] .font-claude-response, .font-claude-response');
        assistantElements.forEach((element, index) => {
            let content = '';
            const markdownContainers = element.querySelectorAll('.standard-markdown, .progressive-markdown');
            if (markdownContainers.length > 0) {
                markdownContainers.forEach(container => {
                    const text = container.textContent?.trim();
                    if (text) content += (content ? '\n\n' : '') + text;
                });
            } else {
                content = element.textContent?.trim() || '';
            }

            if (content && content.length > 10) {
                messages.push({
                    role: 'assistant',
                    content: content,
                    order: element.getBoundingClientRect().top
                });
            }
        });

        // Sort by vertical position to get correct order
        messages.sort((a, b) => a.order - b.order);

        // Remove order field and return
        return messages.map(({role, content}) => ({role, content}));
    }

    // ChatGPT Parser
    function parseChatGPTChat() {
        const messages = [];

        // Try to find messages by role attribute
        const messageElements = document.querySelectorAll('[data-message-author-role]');

        if (messageElements.length > 0) {
            messageElements.forEach((element) => {
                const role = element.getAttribute('data-message-author-role');
                const contentElement = element.querySelector('.markdown') ||
                                       element.querySelector('.prose') ||
                                       element;
                let content = contentElement?.textContent?.trim() || '';

                // Clean up ChatGPT specific artifacts
                content = content.replace(/Copy code/g, '').replace(/\n\s*\n\s*\n/g, '\n\n').trim();

                if (content && content.length > 5) {
                    messages.push({
                        role: role === 'assistant' ? 'assistant' : 'user',
                        content: content
                    });
                }
            });
        } else {
            // Fallback: try conversation turns
            const turns = document.querySelectorAll('[data-testid*="conversation-turn"]');
            turns.forEach((turn, index) => {
                const content = turn.textContent?.trim();
                if (content && content.length > 5) {
                    messages.push({
                        role: index % 2 === 0 ? 'user' : 'assistant',
                        content: content
                    });
                }
            });
        }

        return messages;
    }

    // Gemini Parser
    function parseGeminiChat() {
        const messages = [];

        // User messages
        const userElements = document.querySelectorAll('user-query');
        userElements.forEach((element) => {
            const contentElement = element.querySelector('.query-text') ||
                                   element.querySelector('p') ||
                                   element;
            const content = contentElement?.textContent?.trim();
            if (content) {
                messages.push({
                    role: 'user',
                    content: content,
                    order: element.getBoundingClientRect().top
                });
            }
        });

        // Assistant messages
        const assistantElements = document.querySelectorAll('model-response');
        assistantElements.forEach((element) => {
            const contentElement = element.querySelector('message-content') ||
                                   element.querySelector('.markdown') ||
                                   element;
            const content = contentElement?.textContent?.trim();
            if (content && content.length > 10) {
                messages.push({
                    role: 'assistant',
                    content: content,
                    order: element.getBoundingClientRect().top
                });
            }
        });

        // Sort by position
        messages.sort((a, b) => a.order - b.order);
        return messages.map(({role, content}) => ({role, content}));
    }

    // Convert messages to Q&A pairs
    function convertToQAPairs(messages) {
        const pairs = [];
        let currentQuestion = null;
        let currentAnswer = [];

        for (const msg of messages) {
            if (msg.role === 'user') {
                // Save previous Q&A pair if exists
                if (currentQuestion && currentAnswer.length > 0) {
                    pairs.push({
                        question: currentQuestion,
                        answer: currentAnswer.join('\n\n')
                    });
                }
                currentQuestion = msg.content;
                currentAnswer = [];
            } else if (msg.role === 'assistant') {
                currentAnswer.push(msg.content);
            }
        }

        // Don't forget the last pair
        if (currentQuestion && currentAnswer.length > 0) {
            pairs.push({
                question: currentQuestion,
                answer: currentAnswer.join('\n\n')
            });
        }

        return pairs;
    }

    // Get chat title
    function getTitle(platform) {
        const selectors = {
            claude: ['button[data-testid="chat-menu-trigger"]', 'h1', 'title'],
            chatgpt: ['h1', '.conversation-title', 'title'],
            gemini: ['h1', 'title']
        };

        for (const selector of (selectors[platform] || selectors.chatgpt)) {
            const element = document.querySelector(selector);
            if (element?.textContent?.trim()) {
                const text = element.textContent.trim();
                if (text.length > 3 && text.length < 200) {
                    return text;
                }
            }
        }
        return `${platform.charAt(0).toUpperCase() + platform.slice(1)} Chat Export`;
    }

    // Main function
    function scrapeChat() {
        const platform = detectPlatform();

        if (platform === 'unknown') {
            alert('Claudex StudyMate: This page is not supported.\n\nSupported platforms:\n- claude.ai\n- chat.openai.com\n- chatgpt.com\n- gemini.google.com');
            return null;
        }

        console.log(`Claudex StudyMate: Detected platform: ${platform}`);

        let messages;
        switch (platform) {
            case 'claude':
                messages = parseClaudeChat();
                break;
            case 'chatgpt':
                messages = parseChatGPTChat();
                break;
            case 'gemini':
                messages = parseGeminiChat();
                break;
        }

        if (!messages || messages.length === 0) {
            alert('Claudex StudyMate: No messages found on this page.\n\nMake sure you are on an active chat conversation.');
            return null;
        }

        const qaPairs = convertToQAPairs(messages);
        const title = getTitle(platform);

        const exportData = {
            title: title,
            platform: platform,
            exportDate: new Date().toISOString(),
            sessions: qaPairs
        };

        // Copy to clipboard
        const jsonString = JSON.stringify(exportData, null, 2);

        navigator.clipboard.writeText(jsonString).then(() => {
            console.log('Claudex StudyMate: Data copied to clipboard!');
            console.log(`Found ${qaPairs.length} Q&A sessions`);
            alert(`✅ Claudex StudyMate Export Complete!\n\n` +
                  `Platform: ${platform}\n` +
                  `Sessions found: ${qaPairs.length}\n\n` +
                  `The data has been copied to your clipboard.\n` +
                  `Now paste it into Claudex StudyMate!`);
        }).catch(err => {
            console.error('Failed to copy:', err);
            // Fallback: show in console
            console.log('=== COPY THE JSON BELOW ===');
            console.log(jsonString);
            console.log('=== END OF JSON ===');
            alert(`Claudex StudyMate: Found ${qaPairs.length} sessions.\n\n` +
                  `Could not copy to clipboard automatically.\n` +
                  `Please copy the JSON from the console (scroll up).`);
        });

        return exportData;
    }

    // Run the scraper
    scrapeChat();
})();
