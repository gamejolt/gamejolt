import { ChatClientLazy } from '../lazy';
import { ChatClient } from './client';

export const ChatStoreKey = Symbol('chat-store');

export class ChatStore {
	chat: ChatClient | null = null;
	wantsChat = false;
	loadPromise: Promise<void> | null = null;
}

export async function loadChat(store: ChatStore) {
	store.wantsChat = true;

	if (store.loadPromise) {
		await store.loadPromise;
		return;
	}

	try {
		store.loadPromise = new Promise(() => {
			return ChatClientLazy().then(({ ChatClient: ChatClient_, destroy }) => {
				// Abort if by the time we lazy loaded the chat component we requested to clear it.
				if (!store.wantsChat) {
					return;
				}

				if (store.chat) {
					destroy(store.chat);
				}

				store.chat = new ChatClient_();
			});
		});

		await store.loadPromise;
	} finally {
		store.loadPromise = null;
	}
}

/**
 * Destroys and unsets the current chat instance if one exists.
 *
 * This action does not abort itself if we requested to load the chat while this was running.
 * The chat instance that was set by the time this function was invoked will be destroyed.
 */
export async function clearChat(store: ChatStore) {
	store.wantsChat = false;

	const chat = store.chat;
	if (!chat) {
		return;
	}
	const chatId = chat.id;

	const { destroy } = await ChatClientLazy();
	destroy(chat);

	if (chat === store.chat && chatId === chat.id) {
		store.chat = null;
	}
}
