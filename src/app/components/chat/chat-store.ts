import { inject, InjectionKey } from 'vue';
import { AppStore } from '../../store';
import { ChatClientLazy } from '../lazy';
import { ChatClient as ChatClientType } from './client';

export const ChatStoreKey: InjectionKey<ChatStore> = Symbol('chat-store');
export class ChatStore {
	chat: ChatClientType | null = null;

	_wantsChat = false;
	_loadPromise: Promise<void> | null = null;
}

export function useChatStore() {
	return inject(ChatStoreKey);
}

export async function loadChat(store: ChatStore, appStore: AppStore) {
	store._wantsChat = true;

	store._loadPromise ??= _doLoadChat(store, appStore);
	await store._loadPromise;
}

async function _doLoadChat(store: ChatStore, appStore: AppStore) {
	const { createChatClient, destroy } = await ChatClientLazy();

	// Abort if by the time we lazy loaded the chat component we requested to
	// clear it.
	if (!store._wantsChat) {
		return;
	}

	if (store.chat) {
		destroy(store.chat);
	}

	store.chat = createChatClient({ appStore });
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
