import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../../_common/modal/modal.service';
import { ChatRoom } from '../../../../chat/room';
import { ChatUser } from '../../../../chat/user';
import { ListTitle } from './AppChatModsModal.vue';

interface ChatModsModalOptions {
	chatRoom?: ChatRoom;

	/**
	 * If we should fetch and display current hosts, or only show "Friends" and
	 * "Chat" sections.
	 */
	hasCurrentMods?: boolean;
	initialMods?: ChatUser[];
	initialSection?: ListTitle;
}

export class ChatModsModal {
	/**
	 * Returns `true` if the list of mods changed at some point.
	 */
	static async show(options: ChatModsModalOptions) {
		const { chatRoom, hasCurrentMods, initialMods, initialSection } = options;

		return await showModal<boolean>({
			modalId: 'ChatMods',
			component: defineAsyncComponent(() => import('./AppChatModsModal.vue')),
			props: {
				chatRoom,
				hasCurrentMods,
				initialMods,
				initialSection,
			},
			size: 'sm',
			noEscClose: true,
			noBackdropClose: true,
		});
	}
}
