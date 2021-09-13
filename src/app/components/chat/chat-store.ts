import { ChatClientLazy } from '../lazy';
import { ChatClient } from './client';

export const ChatStoreKey = Symbol('chat-store');
export class ChatStore {
	chat: ChatClient | null = null;

	_wantsChat = false;
	_loadPromise: Promise<void> | null = null;
}

export async function loadChat(store: ChatStore) {
	store._wantsChat = true;

	store._loadPromise ??= _doLoadChat(store);
	await store._loadPromise;
}

async function _doLoadChat(store: ChatStore) {
	const { ChatClient: ChatClient_, destroy } = await ChatClientLazy();

	// Abort if by the time we lazy loaded the chat component we requested to
	// clear it.
	if (!store._wantsChat) {
		return;
	}

	if (store.chat) {
		destroy(store.chat);
	}

	store.chat = new ChatClient_();
	store._loadPromise = null;
}

/**
 * Destroys and unsets the current chat instance if one exists.
 *
 * This action does not abort itself if we requested to load the chat while this
 * was running. The chat instance that was set by the time this function was
 * invoked will be destroyed.
 */
export async function clearChat(store: ChatStore) {
	store._wantsChat = false;

	const { chat } = store;
	if (!chat) {
		return;
	}

	// We unset the chat immediately to avoid a race condition where the chat is
	// cleared multiple times and getting instantiated between the actual calls
	// to destroy()
	store.chat = null;

	const { destroy } = await ChatClientLazy();
	destroy(chat);
}
