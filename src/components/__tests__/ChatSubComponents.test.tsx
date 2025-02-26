// src/components/__tests__/ChatSubComponents.test.tsx
import { ChatMessage } from '../ChatSubComponents'; // Import ChatMessage
import { render } from '@testing-library/react';
import { Message } from '../../types';

describe('ChatMessage - nonCodeContent Extraction', () => {
    const createMessage = (content: string): Message => {
        return {
            id: 'test-id',
            content: content,
            role: 'assistant',
            timestamp: new Date(),
        };
    };
    const getNonCodeContent = (messageContent: string) => {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/; // Corrected regex
		const parts = messageContent.split(codeBlockRegex);
		const nonCodeContent = parts.filter((part, index) => {
		    return index % 2 === 0 && typeof part === 'string' && part.trim() !== '';
		}).join('');

        return nonCodeContent;
    };

    it('a) No Code Block', () => {
        const message = createMessage("This is plain text.");
        expect(getNonCodeContent(message.content)).toBe("This is plain text.");
    });

    it('b) Single Code Block', () => {
        const message = createMessage("```\nconsole.log('hello');\n```");
        expect(getNonCodeContent(message.content)).toBe("");
    });

    it('c) Text Before Code Block', () => {
        const message = createMessage("Here's some code:\n```\nconst x = 1;\n```");
        expect(getNonCodeContent(message.content)).toBe("Here's some code:\n");
    });

    it('d) Code Block Before Text', () => {
        const message = createMessage("```\nconst x = 1;\n```\nThis is after the code.");
        expect(getNonCodeContent(message.content)).toBe("\nThis is after the code.");
    });

    it('e) Text, Code Block, Text', () => {
        const message = createMessage("Intro\n```\ncode\n```\nOutro");
        expect(getNonCodeContent(message.content)).toBe("Intro\n\nOutro");
    });

    it('f) Multiple Code Blocks', () => {
        const message = createMessage("```\ncode1\n```\nText\n```\ncode2\n```");
        expect(getNonCodeContent(message.content)).toBe("\nText\n");
    });

    it('g) Code Block with Language', () => {
        const message = createMessage("```javascript\nconst x = 1;\n```");
        expect(getNonCodeContent(message.content)).toBe("");
    });

    it('h) Empty Code Block', () => {
        const message = createMessage("```\n```");
        expect(getNonCodeContent(message.content)).toBe("");
    });

    it('i) Code Block with Only Whitespace', () => {
        const message = createMessage("```\n   \n```");
        expect(getNonCodeContent(message.content)).toBe("");
    });

    it('j) Message Starts/Ends with Newline', () => {
        const message = createMessage("\nText\n```\ncode\n```\n");
        expect(getNonCodeContent(message.content)).toBe("\nText\n");
    });

    it('k) Empty Message', () => {
        const message = createMessage("");
        expect(getNonCodeContent(message.content)).toBe("");
    });

    it('l) Message with Only Whitespace', () => {
        const message = createMessage("   ");
        expect(getNonCodeContent(message.content)).toBe("");
    });

    it('m) Nested Code Blocks', () => {
      const message = createMessage("```javascript\nfunction outer() {\n  ```\n  inner code\n  ```\n}\n```");
      expect(getNonCodeContent(message.content)).toBe("");
    });

    it('n) Backticks within Text', () => {
        const message = createMessage("Here is some text with a `single backtick`.");
        expect(getNonCodeContent(message.content)).toBe("Here is some text with a `single backtick`.");
    });

   it('o) Incomplete code fences', () => {
      const message = createMessage("Here is some text with a ```incomplete code fence");
      expect(getNonCodeContent(message.content)).toBe("Here is some text with a ```incomplete code fence");

      const message2 = createMessage("Here is some text with a \n```javascript\nincomplete code fence");
      expect(getNonCodeContent(message2.content)).toBe("Here is some text with a \n");
    })

    it('p) Code blocks with different languages', () => {
        const message = createMessage("```javascript\nconsole.log('hello');\n```\n```python\nprint('hello')\n```");
        expect(getNonCodeContent(message.content)).toBe("\n");
    });
});