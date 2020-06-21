import Component from 'vue-class-component';
import { Emit, InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { ContentContext } from '../../../../../../_common/content/content-context';
import { ContentDocument } from '../../../../../../_common/content/content-document';
import AppFormControlContentTS from '../../../../../../_common/form-vue/control/content/content';
import AppFormControlContent from '../../../../../../_common/form-vue/control/content/content.vue';
import AppForm from '../../../../../../_common/form-vue/form';
import { BaseForm } from '../../../../../../_common/form-vue/form.service';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { ChatClient, ChatKey } from '../../../client';

export type FormModel = {
	content: string;
};

@Component({
	components: {
		AppFormControlContent,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatWindowSendForm extends BaseForm<FormModel> {
	@InjectReactive(ChatKey) chat!: ChatClient;
	@Prop(propRequired(Boolean)) multiLineMode!: boolean;

	contentContext: ContentContext = 'chat-message';

	$refs!: {
		form: AppForm;
		editor: AppFormControlContentTS;
	};

	@Emit('submit')
	emitSubmit(_content: string) {}

	@Emit('multi-line-mode-change')
	emitMultiLineModeChange(_multiLine: boolean) {}

	get contentEditorTempResourceContextData() {
		if (this.chat && this.chat.room) {
			return { roomId: this.chat.room.id };
		}
	}

	get placeholder() {
		if (this.chat && this.chat.room) {
			if (this.chat.room.isPmRoom && this.chat.room.user) {
				return this.$gettextInterpolate('Message @%{ username }', {
					username: this.chat.room.user.username,
				});
			}
		}
		return this.$gettext('Send a message...');
	}

	async submitMessage() {
		const doc = ContentDocument.fromJson(this.formModel.content);
		if (doc.hasContent) {
			this.emitSubmit(this.formModel.content);
			this.setField('content', '');

			// Wait for errors, then clear them.
			await this.$nextTick();
			this.$refs.form.clearErrors();
		}
	}

	onClickSubmit() {
		this.submitMessage();
	}

	async onEditorSubmit() {
		await this.submitMessage();

		// TODO: refocus editor
	}

	onEditorInsertBlockNode(nodeType: string) {
		console.log(nodeType);
		this.emitMultiLineModeChange(true);
	}
}
