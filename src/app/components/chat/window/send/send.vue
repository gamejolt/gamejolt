<script lang="ts">
import { Emit, Inject, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { ContentDocument } from '../../../../../_common/content/content-document';
import { AppContentEditorLazy } from '../../../../../_common/content/content-editor/content-editor-lazy';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ChatStore, ChatStoreKey } from '../../chat-store';
import { editMessage, queueChatMessage, setMessageEditing } from '../../client';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';
import AppChatWindowSendForm from './form/form.vue';

@Options({
	components: {
		AppContentEditor: AppContentEditorLazy,
		AppChatWindowSendForm,
	},
})
export default class AppChatWindowSend extends Vue {
	@Prop({ type: Object, required: true }) room!: ChatRoom;

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	singleLineMode = true;

	readonly Screen = Screen;

	@Emit('focus-change')
	emitFocusChange(_focused: boolean) {}

	get chat() {
		return this.chatStore.chat!;
	}

	get isSingleLineMode() {
		// We always want to be in multiline mode for phones:
		// It's expected behavior to create a new line with the "Enter" key on the virtual keyboard,
		// and send the message with a "send message" button.
		if (Screen.isMobile) {
			return false;
		}

		return this.singleLineMode;
	}

	editMessage(message: ChatMessage) {
		setMessageEditing(this.chat, null);

		const doc = ContentDocument.fromJson(message.content);
		if (doc instanceof ContentDocument) {
			const contentJson = doc.toJson();
			message.content = contentJson;
		}

		editMessage(this.chat, this.room, message);
	}

	sendMessage(message: ChatMessage) {
		const doc = ContentDocument.fromJson(message.content);
		if (doc instanceof ContentDocument) {
			const contentJson = doc.toJson();
			queueChatMessage(this.chat, 'content', contentJson, this.room.id);
		}
	}

	submit(message: ChatMessage) {
		this.chat.messageEditing ? this.editMessage(message) : this.sendMessage(message);

		this.singleLineMode = true;
	}

	onFormCancel() {
		setMessageEditing(this.chat, null);
	}

	onSingleLineModeChanged(singleLineMode: boolean) {
		this.singleLineMode = singleLineMode;
	}

	@Watch('room.id')
	async onRoomChanged() {
		setMessageEditing(this.chat, null);
	}
}
</script>

<template>
	<!-- Message Sending -->
	<div class="chat-window-send fill-backdrop">
		<div class="-container">
			<AppChatWindowSendForm
				:single-line-mode="isSingleLineMode"
				:room="room"
				@submit="submit($event)"
				@cancel="onFormCancel"
				@single-line-mode-change="onSingleLineModeChanged($event)"
				@focus-change="emitFocusChange"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

.-container
	position: relative
</style>
