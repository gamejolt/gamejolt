<script lang="ts" setup>
import { computed, inject, PropType, ref, toRefs, watch } from 'vue';
import { ContentDocument } from '../../../../../_common/content/content-document';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ChatStoreKey } from '../../chat-store';
import { editMessage as chatEditMessage, queueChatMessage, setMessageEditing } from '../../client';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';
import AppChatWindowSendForm from './form/form.vue';

const props = defineProps({
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
});

const emit = defineEmits({
	'focus-change': (_focused: boolean) => true,
});

const { room } = toRefs(props);
const chatStore = inject(ChatStoreKey)!;

const singleLineMode = ref(true);

const chat = computed(() => chatStore.chat!);

const isSingleLineMode = computed(() => {
	// We always want to be in multiline mode for phones:
	// It's expected behavior to create a new line with the "Enter" key on the virtual keyboard,
	// and send the message with a "send message" button.
	if (Screen.isMobile) {
		return false;
	}

	return singleLineMode.value;
});

watch(() => room.value.id, onRoomChanged);

function editMessage(message: ChatMessage) {
	setMessageEditing(chat.value, null);

	const doc = ContentDocument.fromJson(message.content);
	if (doc instanceof ContentDocument) {
		const contentJson = doc.toJson();
		message.content = contentJson;
	}

	chatEditMessage(chat.value, room.value, message);
}

function sendMessage(message: ChatMessage) {
	const doc = ContentDocument.fromJson(message.content);
	if (doc instanceof ContentDocument) {
		const contentJson = doc.toJson();
		queueChatMessage(chat.value, 'content', contentJson, room.value.id);
	}
}

function submit(message: ChatMessage) {
	if (chat.value.messageEditing) {
		editMessage(message);
	} else {
		sendMessage(message);
	}

	singleLineMode.value = true;
}

function onFormCancel() {
	setMessageEditing(chat.value, null);
}

function onSingleLineModeChanged(newMode: boolean) {
	singleLineMode.value = newMode;
}

async function onRoomChanged() {
	setMessageEditing(chat.value, null);
}
</script>

<template>
	<div class="chat-window-send">
		<div class="-container">
			<AppChatWindowSendForm
				:room="room"
				:single-line-mode="isSingleLineMode"
				@submit="submit($event)"
				@cancel="onFormCancel"
				@single-line-mode-change="onSingleLineModeChanged($event)"
				@focus-change="emit('focus-change', $event)"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

.-container
	position: relative
</style>
