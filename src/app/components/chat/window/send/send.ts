import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
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

	multiLineMode = false;

	readonly Screen = Screen;

	sendMessage(message: string) {
		const doc = ContentDocument.fromJson(message);
		if (doc instanceof ContentDocument) {
			const contentJson = doc.toJson();
			const room = this.chat.room;
			if (room) {
				queueChatMessage(this.chat, contentJson, room.id);
			}
		}

		this.multiLineMode = false;
	}

	onMultiLineModeChanged(multiLineMode: boolean) {
		this.multiLineMode = multiLineMode;
	}
}
