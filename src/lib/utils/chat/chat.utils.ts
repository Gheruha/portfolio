import { ChatDto } from '@/lib/types/chat.type';
import { HistoryItemDto } from '@/lib/types/history.type';
import { getChatConversationById } from './history.utils';

const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful assistant for this portfolio application.';

export const saveMessage = async ({
  conversationId,
  sender,
  content,
}: {
  conversationId: string;
  sender: 'user' | 'bot';
  content: string;
}): Promise<void> => {
  void conversationId;
  void sender;
  void content;
  return;
};

export const generateChatBotReply = async ({
  promptKey,
  userMessage,
  conversationId,
}: ChatDto): Promise<string> => {
  void promptKey;
  if (!conversationId) {
    throw new Error('Missing conversationId');
  }

  const history: HistoryItemDto[] =
    await getChatConversationById(conversationId);

  const historyMessages = history.map(m => ({
    role: m.from === 'bot' ? 'assistant' : 'user',
    content: m.text,
  }));

  const messages = [
    { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
    ...historyMessages,
    { role: 'user', content: userMessage },
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('OpenAI error:', err);
    throw new Error(err.error?.message || 'OpenAI request failed');
  }

  const { choices } = await res.json();
  return choices[0].message.content;
};
