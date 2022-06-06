<script lang="ts">
import { computed, inject, PropType } from 'vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { useAppStore } from '../../../store/index';
import { ChatStoreKey } from '../chat-store';
import { leaveChatRoom } from '../client';
import { ChatRoom } from '../room';
import AppChatWindow from './AppChatWindow.vue';
</script>

<script lang="ts" setup>
defineProps({
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
});

const { toggleLeftPane } = useAppStore();
const chatStore = inject(ChatStoreKey)!;

const chat = computed(() => chatStore.chat!);

function close() {
	// xs size needs to show the friends list when closing the room.
	// any other size can close the whole chat instead
	if (Screen.isXs) {
		leaveChatRoom(chat.value);
	} else {
		toggleLeftPane();
	}
}
</script>

<template>
	<div class="chat-window-container">
		<!-- We sadly need the chat close thing twice. It takes up the empty
		background space so you can click that to close chat. -->
		<div class="-close" @click="close" />
		<div class="-window">
			<div class="-close" @click="close" />

			<AppChatWindow :room="room" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.chat-window-container
	position: fixed
	display: flex
	justify-content: center
	align-items: flex-start
	z-index: $zindex-chat-window
	padding: 16px 20px 16px 16px

.-close
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	background: transparent
	z-index: 0

.-window
	change-bg(bg)
	position: relative
	display: flex
	flex: auto
	justify-content: center
	width: 100%
	height: 100%
	z-index: 1
	overflow: hidden

	@media $media-xs
		position: fixed
		top: 0
		right: 0
		left: 0
		bottom: 0
		height: auto !important
		width: auto !important

	@media $media-sm-up
		rounded-corners-lg()
</style>
