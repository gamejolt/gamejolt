import Component from 'vue-class-component';
import { Emit, InjectReactive, Prop } from 'vue-property-decorator';
import { EventBus } from '../../../../../../../system/event/event-bus.service';
import { propRequired } from '../../../../../../../utils/vue';
import { ContentContext } from '../../../../../../../_common/content/content-context';
import { ContentDocument } from '../../../../../../../_common/content/content-document';
import { ContentRules } from '../../../../../../../_common/content/content-editor/content-rules';
import AppFormControlContentTS from '../../../../../../../_common/form-vue/control/content/content';
import AppFormControlContent from '../../../../../../../_common/form-vue/control/content/content.vue';
import AppForm from '../../../../../../../_common/form-vue/form';
import { BaseForm } from '../../../../../../../_common/form-vue/form.service';
import { AppObserveDimensions } from '../../../../../../../_common/observe-dimensions/observe-dimensions.directive';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import AppShortkey from '../../../../../../../_common/shortkey/shortkey.vue';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { ChatClient, ChatKey } from '../../../../client';
import { ChatMessage, CHAT_MESSAGE_MAX_CONTENT_LENGTH } from '../../../../message';
import { ChatRoom } from '../../../../room';

@Component({
	components: {
		AppFormControlContent,
		AppShortkey,
	},
	directives: {
		AppTooltip,
		AppObserveDimensions,
	},
})
export default class AppChatWindowOutputItemForm extends BaseForm<ChatMessage> {
	@InjectReactive(ChatKey) chat!: ChatClient;
	@Prop(propRequired(Boolean)) singleLineMode!: boolean;
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;

	readonly contentContext: ContentContext = 'chat-message';
	// Allow images to be up to 100px in height so that image and a chat message fit into the editor without scrolling.
	readonly displayRules = new ContentRules({ maxMediaWidth: 125, maxMediaHeight: 100 });

	isEditorFocused = false;

	// Don't show "Do you want to save" when dismissing the form.
	warnOnDiscard = false;

	$refs!: {
		form: AppForm;
		editor: AppFormControlContentTS;
	};

	@Emit('submit')
	emitSubmit(_msg: ChatMessage) {}

	@Emit('single-line-mode-change')
	emitSingleLineModeChange(_singleLine: boolean) {}

	get contentEditorTempResourceContextData() {
		if (this.chat && this.chat.room) {
			return { roomId: this.chat.room.id };
		}
	}

	get shouldShiftEditor() {
		return Screen.isMobile && this.isEditorFocused;
	}

	get hasContent() {
		if (!this.formModel.content) {
			return false;
		}

		const doc = ContentDocument.fromJson(this.formModel.content);
		return doc.hasContent;
	}

	get maxContentLength() {
		return [CHAT_MESSAGE_MAX_CONTENT_LENGTH];
	}

	async submitMessage() {
		let doc;

		try {
			doc = ContentDocument.fromJson(this.formModel.content);
		} catch {
			// Tried submitting empty doc.
			return;
		}

		if (doc.hasContent) {
			this.emitSubmit(this.formModel);
		} else {
			// When the user tried to submit an empty doc and is in multi line mode, reset to single line.
			// They are probably trying to exit that mode, since submitting an empty message is nonsense.
			this.emitSingleLineModeChange(true);
		}
	}

	async onSubmit() {
		if (this.hasFormErrors) {
			return;
		}

		await this.submitMessage();
	}

	onEditorInsertBlockNode(_nodeType: string) {
		this.emitSingleLineModeChange(false);
	}

	async onFocusEditor() {
		const wasShifted = this.shouldShiftEditor;

		this.isEditorFocused = true;

		// Wait until the editor controls are visible.
		await this.$nextTick();
		if (!wasShifted && this.shouldShiftEditor) {
			// We want to emit this event here too, to make sure we scroll down when the controls pop up on mobile.
			this.onInputResize();
		}
	}

	onBlurEditor() {
		this.isEditorFocused = false;
	}

	onCancel() {
		this.$emit('cancel');
	}

	onTabKeyPressed() {
		if (!this.isEditorFocused) {
			this.$refs.editor.focus();
		}
	}

	onInputResize() {
		EventBus.emit('Chat.inputResize');
	}
}
