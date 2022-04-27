<script lang="ts">
import { nextTick } from 'vue';
import { Emit, Inject, mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { createFocusToken } from '../../../../../../utils/focus-token';
import { isMac } from '../../../../../../utils/utils';
import { shallowSetup } from '../../../../../../utils/vue';
import { ContentDocument } from '../../../../../../_common/content/content-document';
import { ContentRules } from '../../../../../../_common/content/content-editor/content-rules';
import {
	EscapeStack,
	EscapeStackCallback,
} from '../../../../../../_common/escape-stack/escape-stack.service';
import AppFormControlContent from '../../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import { BaseForm } from '../../../../../../_common/form-vue/form.service';
import { validateContentMaxLength } from '../../../../../../_common/form-vue/validators';
import { FormValidatorContentNoMediaUpload } from '../../../../../../_common/form-vue/validators/content_no_media_upload';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppShortkey from '../../../../../../_common/shortkey/AppShortkey.vue';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { ChatStore, ChatStoreKey } from '../../../chat-store';
import { setMessageEditing, startTyping, stopTyping, tryGetRoomRole } from '../../../client';
import { ChatMessage, CHAT_MESSAGE_MAX_CONTENT_LENGTH } from '../../../message';
import { ChatRoom } from '../../../room';

const TYPING_TIMEOUT_INTERVAL = 3000;

export type FormModel = {
	content: string;
	id?: number;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlContent,
		AppShortkey,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppChatWindowSendForm extends mixins(Wrapper) {
	@Prop({ type: Boolean, required: true }) singleLineMode!: boolean;
	@Prop({ type: Object, required: true }) room!: ChatRoom;

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	readonly Screen = Screen;
	// Allow images to be up to 100px in height so that image and a chat message fit into the editor without scrolling.
	readonly displayRules = new ContentRules({ maxMediaWidth: 125, maxMediaHeight: 100 });

	isEditorFocused = false;
	typing = false;
	focusToken = shallowSetup(() => createFocusToken());

	private nextMessageTimeout: NodeJS.Timer | null = null;
	private escapeCallback?: EscapeStackCallback;
	private typingTimeout!: NodeJS.Timer;

	readonly validateContentMaxLength = validateContentMaxLength;

	@Emit('submit') emitSubmit(_content: FormModel) {}
	@Emit('cancel') emitCancel() {}
	@Emit('single-line-mode-change') emitSingleLineModeChange(_singleLine: boolean) {}
	@Emit('focus-change') emitFocusChange(_focused: boolean) {}

	get chat() {
		return this.chatStore.chat!;
	}

	get contentEditorTempResourceContextData() {
		if (this.chat && this.room) {
			return { roomId: this.room.id };
		}
		return undefined;
	}

	get placeholder() {
		if (this.chat && this.room) {
			if (this.room.isPmRoom && this.room.user) {
				return this.$gettextInterpolate('Message @%{ username }', {
					username: this.room.user.username,
				});
			}
		}
		return this.$gettext('Send a message...');
	}

	get shouldShiftEditor() {
		return Screen.isXs && this.isEditorFocused;
	}

	get hasContent() {
		if (!this.formModel.content) {
			return false;
		}

		const doc = ContentDocument.fromJson(this.formModel.content);
		return doc.hasContent;
	}

	get isMac() {
		return isMac();
	}

	get showMultiLineNotice() {
		return !this.singleLineMode && !Screen.isMobile;
	}

	get maxContentLength() {
		return CHAT_MESSAGE_MAX_CONTENT_LENGTH;
	}

	get isSendButtonDisabled() {
		if (!this.valid || !this.hasContent || this.nextMessageTimeout !== null) {
			return true;
		}

		return !FormValidatorContentNoMediaUpload(this.formModel.content ?? '');
	}

	get isEditing() {
		return !!this.chat.messageEditing || false;
	}

	get editorModelId() {
		return this.formModel.id || null;
	}

	get typingText() {
		const usersOnline = this.chat.roomMembers[this.room.id];
		if (!usersOnline || usersOnline.collection.length === 0) {
			return [];
		}

		const typingNames = usersOnline.collection
			.filter(user => user.typing)
			.filter(user => user.id !== this.chat.currentUser?.id)
			.map(user => user.display_name);

		const displayNamePlaceholderValues = {
			user1: typingNames[0],
			user2: typingNames[1],
			user3: typingNames[2],
		};

		if (typingNames.length > 3) {
			return this.$gettext(`Several people are typing...`);
		} else if (typingNames.length === 3) {
			return this.$gettextInterpolate(
				`%{ user1 }, %{ user2 } and %{ user3 } are typing...`,
				displayNamePlaceholderValues
			);
		} else if (typingNames.length === 2) {
			return this.$gettextInterpolate(
				`%{ user1 } and %{ user2 } are typing...`,
				displayNamePlaceholderValues
			);
		} else if (typingNames.length === 1) {
			return this.$gettextInterpolate(
				`%{ user1 } is typing...`,
				displayNamePlaceholderValues
			);
		}

		return '';
	}

	@Watch('chat.messageEditing')
	async onMessageEditing(message: ChatMessage | null) {
		if (message) {
			this.setField('content', message.content);
			this.setField('id', message.id);

			// Wait in case the editor loses focus
			await nextTick();
			// Regain focus on the editor
			this.focusToken.focus();

			this.escapeCallback = () => this.cancelEditing();
			EscapeStack.register(this.escapeCallback);
		} else {
			if (this.escapeCallback) {
				EscapeStack.deregister(this.escapeCallback);
				this.escapeCallback = undefined;
			}
		}
	}

	@Watch('room.id')
	async onRoomChanged() {
		if (this.formModel.content !== '') {
			// Clear out the editor when entering a new room.
			this.clearMsg();
		}

		// Then focus it.
		this.focusToken.focus();
	}

	created() {
		this.form.warnOnDiscard = false;
		this.setField('content', '');
	}

	unmounted() {
		if (this.typingTimeout) {
			clearTimeout(this.typingTimeout);
		}
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
			const submit: FormModel = { content: this.formModel.content };
			if (this.isEditing) {
				submit.id = this.formModel.id;
			}

			this.emitSubmit(submit);
			this.clearMsg();
		} else {
			// When the user tried to submit an empty doc and is in multi line mode, reset to single line.
			// They are probably trying to exit that mode, since submitting an empty message is nonsense.
			this.emitSingleLineModeChange(true);
		}
	}

	async onSubmit() {
		if (!this.form.valid) {
			return;
		}

		if (this.nextMessageTimeout !== null) {
			return;
		}

		// Manually check for if media is uploading here.
		// We don't want to put the rule directly on the form cause showing form errors
		// for the media upload is sort of disruptive for chat messages.
		if (!FormValidatorContentNoMediaUpload(this.formModel.content)) {
			return;
		}

		await this.submitMessage();

		this.disableTypingTimeout();

		// Refocus editor after submitting message with enter.
		this.focusToken.focus();

		this.applyNextMessageTimeout();
	}

	private applyNextMessageTimeout() {
		if (!this.room.isFiresideRoom) {
			return;
		}

		// For fireside rooms, timeout the user from sending another message for 1.5s.
		// Do not do this for the owner/mods.
		if (this.chat.currentUser?.id === this.room.owner_id) {
			return;
		}
		if (this.chat.currentUser) {
			const userRole = tryGetRoomRole(this.chat, this.room, this.chat.currentUser);
			if (userRole === 'owner' || userRole === 'moderator') {
				return;
			}
		}

		this.nextMessageTimeout = setTimeout(() => {
			if (this.nextMessageTimeout) {
				clearTimeout(this.nextMessageTimeout);
				this.nextMessageTimeout = null;
			}
		}, 1500);
	}

	onChange(_value: string) {
		if (!this.typing) {
			this.typing = true;
			startTyping(this.chat, this.room);
		} else {
			clearTimeout(this.typingTimeout);
		}
		this.typingTimeout = setTimeout(this.disableTypingTimeout, TYPING_TIMEOUT_INTERVAL);
	}

	onEditorInsertBlockNode(_nodeType: string) {
		this.emitSingleLineModeChange(false);
	}

	onFocusEditor() {
		this.isEditorFocused = true;
		this.emitFocusChange(true);
	}

	onBlurEditor() {
		this.isEditorFocused = false;
		this.emitFocusChange(false);
	}

	onTabKeyPressed() {
		if (!this.isEditorFocused) {
			this.focusToken.focus();
		}
	}

	onUpKeyPressed(event: KeyboardEvent) {
		if (this.isEditing || this.hasContent) {
			return;
		}

		// Find the last message sent by the current user.
		const userMessages = this.chat.messages[this.room.id].filter(
			msg => msg.user.id === this.chat.currentUser?.id
		);
		const lastMessage = userMessages[userMessages.length - 1];

		if (lastMessage) {
			// Prevent the "up" key press. This is to stop it from acting as a "go to beginning of line".
			// The content editor is focused immediately after this, and we want the editor to focus the end
			// of the content. This prevents it jump to the beginning of the line.
			event.preventDefault();

			setMessageEditing(this.chat, lastMessage);
		}
	}

	async cancelEditing() {
		this.emitCancel();
		setMessageEditing(this.chat, null);
		this.clearMsg();

		// Wait in case the editor loses focus
		await nextTick();
		// Regain focus on the editor
		this.focusToken.focus();
	}

	private async clearMsg() {
		this.setField('content', '');
		this.setField('id', undefined);

		// Wait for errors, then clear them.
		await nextTick();
		this.form.clearErrors();
	}

	private disableTypingTimeout() {
		this.typing = false;
		stopTyping(this.chat, this.room);
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppShortkey shortkey="tab" @press="onTabKeyPressed" />

		<div class="-top-indicators">
			<span v-if="Screen.isXs && !!typingText" class="-typing">
				{{ typingText }}
			</span>
		</div>

		<div v-if="isEditing" class="-editing-message">
			<AppJolticon icon="edit" />
			<AppTranslate>Editing Message</AppTranslate>
			<a class="-editing-message-cancel" @click="cancelEditing">
				<AppTranslate>Cancel</AppTranslate>
			</a>
		</div>

		<AppFormGroup
			name="content"
			hide-label
			class="-form"
			:class="{
				'-form-shifted': shouldShiftEditor,
				'-editing': isEditing,
			}"
		>
			<div class="-input">
				<AppFormControlContent
					:key="room.id"
					ref="editor"
					:content-context="room.messagesContentContext"
					:temp-resource-context-data="contentEditorTempResourceContextData"
					:placeholder="placeholder"
					:single-line-mode="singleLineMode"
					:validators="[validateContentMaxLength(maxContentLength)]"
					:max-height="160"
					:display-rules="displayRules"
					:compact="Screen.isXs"
					:autofocus="!Screen.isMobile"
					:model-id="editorModelId"
					:focus-token="focusToken"
					focus-end
					@submit="onSubmit"
					@insert-block-node="onEditorInsertBlockNode"
					@focus="onFocusEditor"
					@blur="onBlurEditor"
					@keydown.up="onUpKeyPressed($event)"
					@changed="onChange($event)"
				/>

				<AppFormControlErrors label="message" />
			</div>

			<AppButton
				v-app-tooltip="isEditing ? $gettext(`Edit message`) : $gettext(`Send message`)"
				:disabled="isSendButtonDisabled"
				class="-send-button"
				sparse
				:icon="isEditing ? 'check' : 'share-airplane'"
				:primary="hasContent"
				:trans="!hasContent"
				:solid="hasContent"
				@click="onSubmit"
			/>
		</AppFormGroup>

		<div v-if="!Screen.isXs" class="-bottom-indicators anim-fade-in no-animate-leave">
			<transition name="fade">
				<span v-if="!Screen.isXs && !!typingText" class="-typing">
					{{ typingText }}
				</span>
			</transition>

			<span v-if="showMultiLineNotice" class="-multi-line">
				<AppJolticon icon="notice" />
				<span v-if="isMac" v-translate>
					You are in multi-line editing mode. Press
					<code>cmd+enter</code>
					to send.
				</span>
				<span v-else v-translate>
					You are in multi-line editing mode. Press
					<code>ctrl+enter</code>
					to send.
				</span>
			</span>
		</div>
	</AppForm>
</template>

<style lang="stylus" scoped>
@import '../../variables'

$-button-height = 48px
$-button-width = 40px
$-button-margin = 4px
$-button-spacing = $-button-width + ($-button-margin * 3)
$-button-spacing-xs = $-button-height

.-form
	display: flex
	position: relative
	margin-bottom: 0

	@media $media-xs
		margin-top: 4px
		border-top: $border-width-base solid var(--theme-bg-subtle)
		padding-top: 1px

	@media $media-sm-up
		margin-top: 8px

	&-shifted
		margin-bottom: 52px

	&.-editing
		margin-top: 0
		padding-top: 1px
		border-top: none

.-bottom-indicators
.-editing-message
	height: 28px
	color: var(--theme-light)
	padding: 4px 0

.-top-indicators
.-bottom-indicators
	display: flex

.-top-indicators
	padding: 4px 4px 0 4px
	color: var(--theme-light)

.-bottom-indicators
	align-items: center
	margin-left: $left-gutter-size + $avatar-size
	margin-right: $-button-spacing

.-typing
.-multi-line
	&
	.jolticon
		font-size: $font-size-tiny

.-typing
	text-overflow()
	margin-right: auto
	transition-property: opacity
	transition-duration: 500ms
	transition-timing-function: $strong-ease-out

	@media $media-sm-up
		padding-right: 24px

	&.fade-leave-active
		transition-duration: 250ms

	&.fade-enter-from
	&.fade-leave-to
		opacity: 0

.-multi-line
	flex: none
	margin-left: auto

.-editing-message
	position: relative

	@media $media-xs
		padding-left: 4px
		border-top: $border-width-base solid var(--theme-bg-subtle)

	@media $media-sm-up
		margin-left: $left-gutter-size + $avatar-size
		margin-right: $-button-spacing

	&-cancel
		position: absolute
		right: 0

		@media $media-xs
			right: $-button-spacing-xs + 4px

.-input
	width: 'calc(100% - %s)' % $-button-spacing-xs

	@media $media-sm-up
		margin-left: $left-gutter-size
		width: 'calc(100% - %s)' % ($left-gutter-size + $-button-spacing)

.-send-button
	display: flex
	align-items: center
	justify-content: center
	height: $-button-height
	margin: 0
	flex: none
	align-self: flex-end
	transition: color 0.3s, background-color 0.3s

	@media $media-xs
		width: $-button-spacing-xs
		border-radius: 0

	@media $media-sm-up
		width: $-button-width
		margin: 0 ($-button-margin * 2) 0 $-button-margin

	&.-disabled
		&:hover
			color: var(--theme-fg) !important
			background-color: transparent !important
			border-color: transparent !important
</style>
