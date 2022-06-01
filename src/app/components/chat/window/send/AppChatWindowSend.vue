<script lang="ts" setup>
import { computed, inject, PropType, toRefs, watch } from 'vue';
import { ContentDocument } from '../../../../../_common/content/content-document';
import { ChatStoreKey } from '../../chat-store';
import { editMessage as chatEditMessage, queueChatMessage, setMessageEditing } from '../../client';
import { ChatRoom } from '../../room';
import AppChatWindowSendForm, { FormModel } from './form/AppChatWindowSendForm.vue';

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

const chat = computed(() => chatStore.chat!);

watch(() => room.value.id, onRoomChanged);

function editMessage({ content, id }: FormModel) {
	setMessageEditing(chat.value, null);
	// This shouldn't happen, but typescript complains without this.
	if (!id) {
		return;
	}

	const doc = ContentDocument.fromJson(content);
	if (doc instanceof ContentDocument) {
		const contentJson = doc.toJson();
		content = contentJson;
	}

	chatEditMessage(chat.value, room.value, { content, id });
}

function sendMessage({ content }: FormModel) {
	const doc = ContentDocument.fromJson(content);
	if (doc instanceof ContentDocument) {
		const contentJson = doc.toJson();
		queueChatMessage(chat.value, 'content', contentJson, room.value.id);
	}
}

function submit(message: FormModel) {
	if (chat.value.messageEditing) {
		editMessage(message);
	} else {
		sendMessage(message);
	}
}

function onFormCancel() {
	setMessageEditing(chat.value, null);
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
				@submit="submit($event)"
				@cancel="onFormCancel"
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
