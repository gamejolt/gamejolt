import { defineAsyncComponent } from 'vue';

import { ChatRoomModel } from '~app/components/chat/room';
import { ChatUser } from '~app/components/chat/user';
import { showModal } from '~common/modal/modal.service';

export async function showChatInviteModal(
	room: ChatRoomModel,
	friends: ChatUser[],
	initialUser?: ChatUser
) {
	return await showModal<boolean | undefined>({
		modalId: 'ChatInvite',
		size: 'sm',
		component: defineAsyncComponent(
			() => import('~app/components/chat/invite-modal/AppChatInviteModal.vue')
		),
		props: { room, friends, initialUser },
	});
}
