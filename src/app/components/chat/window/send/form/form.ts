import ResizeObserver from 'resize-observer-polyfill';
import Component from 'vue-class-component';
import { Emit, InjectReactive, Prop } from 'vue-property-decorator';
import { EventBus } from '../../../../../../system/event/event-bus.service';
import { propRequired } from '../../../../../../utils/vue';
import { ContentContext } from '../../../../../../_common/content/content-context';
import { ContentDocument } from '../../../../../../_common/content/content-document';
import AppFormControlContentTS from '../../../../../../_common/form-vue/control/content/content';
import AppFormControlContent from '../../../../../../_common/form-vue/control/content/content.vue';
import AppForm from '../../../../../../_common/form-vue/form';
import { BaseForm } from '../../../../../../_common/form-vue/form.service';
import { Screen } from '../../../../../../_common/screen/screen-service';
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
	@Prop(propRequired(Boolean)) singleLineMode!: boolean;

	contentContext: ContentContext = 'chat-message';
	resizeObserver?: ResizeObserver;
	isEditorFocused = false;

	$refs!: {
		form: AppForm;
		editor: AppFormControlContentTS;
	};

	@Emit('submit')
	emitSubmit(_content: string) {}

	@Emit('single-line-mode-change')
	emitSingleLineModeChange(_singleLine: boolean) {}

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

	get shouldShiftEditor() {
		return Screen.isMobile && this.isEditorFocused;
	}

	mounted() {
		this.resizeObserver = new ResizeObserver(() => {
			EventBus.emit('Chat.inputResize');
		});
		this.resizeObserver.observe(this.$refs.editor.$el);
	}

	destroyed() {
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = undefined;
		}
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
		this.emitSingleLineModeChange(false);
	}

	async onFocusEditor() {
		const wasShifted = this.shouldShiftEditor;

		this.isEditorFocused = true;

		// Wait until the editor controls are visible.
		await this.$nextTick();
		if (!wasShifted && this.shouldShiftEditor) {
			// We want to emit this event here too, to make sure we scroll down when the controls pop up on mobile.
			EventBus.emit('Chat.inputResize');
		}
	}

	onBlurEditor() {
		this.isEditorFocused = false;
	}
}
