import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { isMac } from '../../../../../utils/utils';
import { ContentDocument } from '../../../../../_common/content/content-document';
import AppContentEditor from '../../../../../_common/content/content-editor/content-editor.vue';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ChatClient, ChatKey, queueChatMessage } from '../../client';
import AppChatWindowSendForm from './form/form.vue';

@Component({
	components: {
		AppContentEditor,
		AppChatWindowSendForm,
	},
	directives: {
		AppFocusWhen,
	},
})
export default class AppChatWindowSend extends Vue {
	@InjectReactive(ChatKey) chat!: ChatClient;

	singleLineMode = true;

	readonly Screen = Screen;

	get isSingleLineMode() {
		// We always want to be in multiline mode for phones:
		// It's expected behavior to create a new line with the "Enter" key on the virtual keyboard,
		// and send the message with a "send message" button.
		if (Screen.isMobile) {
			return false;
		}

		return this.singleLineMode;
	}

	get showMultiLineNotice() {
		return !this.isSingleLineMode && !Screen.isMobile;
	}

	get isMac() {
		return isMac();
	}

	sendMessage(message: string) {
		const doc = ContentDocument.fromJson(message);
		if (doc instanceof ContentDocument) {
			const contentJson = doc.toJson();
			const room = this.chat.room;
			if (room) {
				queueChatMessage(this.chat, contentJson, room.id);
			}
		}

		this.singleLineMode = true;
	}

	onSingleLineModeChanged(singleLineMode: boolean) {
		this.singleLineMode = singleLineMode;
	}
}
