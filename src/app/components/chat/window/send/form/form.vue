<script lang="ts">
import { nextTick } from 'vue';
import { setup } from 'vue-class-component';
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
import { useThemeStore } from '../../../../../../_common/theme/theme.store';
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
	@Prop({ type: Object, required: true }) room!: ChatRoom;

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	readonly Screen = Screen;
	// Allow images to be up to 100px in height so that image and a chat message fit into the editor without scrolling.
	readonly displayRules = new ContentRules({ maxMediaWidth: 125, maxMediaHeight: 100 });

	isEditorFocused = false;
	typing = false;
	focusToken = shallowSetup(() => createFocusToken());
	themeStore = setup(() => useThemeStore());

	private nextMessageTimeout: NodeJS.Timer | null = null;
	private escapeCallback?: EscapeStackCallback;
	private typingTimeout!: NodeJS.Timer;

	readonly validateContentMaxLength = validateContentMaxLength;

	@Emit('submit') emitSubmit(_content: FormModel) {}
	@Emit('cancel') emitCancel() {}
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
		return this.$gettext('Send a message');
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
			this.cancelEditing();
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

		<transition name="fade">
			<div
				v-if="!!typingText || isEditing"
				class="-top-indicators"
				:class="{
					'-light-mode': !themeStore.isDark,
				}"
			>
				<div v-if="typingText">
					{{ typingText }}
				</div>

				<div v-if="isEditing" class="-editing">
					<AppTranslate>Editing...</AppTranslate>
				</div>
			</div>
		</transition>

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
					:single-line-mode="Screen.isDesktop"
					:validators="[validateContentMaxLength(maxContentLength)]"
					:max-height="160"
					:display-rules="displayRules"
					:autofocus="!Screen.isMobile"
					:model-id="editorModelId"
					:focus-token="focusToken"
					focus-end
					@submit="onSubmit"
					@focus="onFocusEditor"
					@blur="onBlurEditor"
					@keydown.up="onUpKeyPressed($event)"
					@changed="onChange($event)"
				/>

				<AppFormControlErrors label="message" />
			</div>

			<div class="-send-button-container">
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
			</div>
		</AppFormGroup>
	</AppForm>
</template>

<style lang="stylus" scoped>
@import '../../variables'

$-button-width = 40px
$-button-height = 40px

.-form
	position: relative
	margin-bottom: 0
	padding: 12px
	display: flex
	gap: 8px
	align-items: stretch

	::v-deep(.content-editor-form-control)
		change-bg(bg-offset)
		border: 0

	@media $media-xs
		border-bottom: 1px solid var(--theme-bg-offset)

.-form-shifted
		margin-bottom: 52px

.-top-indicators
	overlay-text-shadow()
	display: flex
	gap: 24px
	color: white
	font-weight: 600
	padding: 4px 16px
	background-image: linear-gradient(to top, rgba($black, 0.25), rgba($black, 0))
	z-index: 1
	pointer-events: none
	position: absolute
	left: 0
	bottom: 100%
	right: 0
	transition-property: opacity
	transition-duration: 500ms
	transition-timing-function: $strong-ease-out

	&.-light-mode
		background-image: linear-gradient(to top, rgba($black, 0.6), rgba($black, 0))

	> *
		text-overflow()

	&
	&::v-deep(.jolticon)
		font-size: $font-size-tiny

	&.fade-leave-active
		transition-duration: 250ms

	&.fade-enter-from
	&.fade-leave-to
		opacity: 0

.-editing
	margin-left: auto
	flex: none

.-input
	flex: auto

	@media $media-sm-up
		margin-left: $left-gutter-size

.-send-button-container
	display: flex
	flex: none
	flex-direction: column-reverse

.-send-button
	width: $-button-width
	max-height: $-button-height
	flex: auto
	margin: 0
	transition: color 0.3s, background-color 0.3s

	&.-disabled
		&:hover
			color: var(--theme-fg) !important
			background-color: transparent !important
			border-color: transparent !important
</style>
