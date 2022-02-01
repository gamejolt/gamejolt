<script lang="ts">
import { setup } from 'vue-class-component';
import { Inject, Options, Vue } from 'vue-property-decorator';
import { useAppStore } from '../../../store';
import { ChatStore, ChatStoreKey } from '../chat-store';
import AppChatWindow from '../window/window.vue';

@Options({
	components: {
		AppChatWindow,
	},
})
export default class AppChatWindows extends Vue {
	store = setup(() => useAppStore());

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	get visibleLeftPane() {
		return this.store.visibleLeftPane;
	}

	get chat() {
		return this.chatStore.chat!;
	}

	getRoomQueuedMessages(roomId: number) {
		return this.chat.messageQueue.filter(i => i.room_id === roomId);
	}
}
</script>

<template>
	<!--
		Can currently only have one window open at a time.
	-->
	<AppChatWindow
		v-if="chat.room && visibleLeftPane === 'chat'"
		:room="chat.room"
		:messages="chat.messages[chat.room.id]"
		:queued-messages="getRoomQueuedMessages(chat.room.id)"
	/>
</template>
