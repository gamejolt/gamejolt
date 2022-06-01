<script lang="ts">
import { computed, nextTick, onUnmounted, PropType, ref, toRefs, watch } from 'vue';
import { createFocusToken } from '../../../../../../utils/focus-token';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import { ContentDocument } from '../../../../../../_common/content/content-document';
import { ContentRules } from '../../../../../../_common/content/content-editor/content-rules';
import {
	EscapeStack,
	EscapeStackCallback,
} from '../../../../../../_common/escape-stack/escape-stack.service';
import AppForm, {
	createForm,
	FormController,
} from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '../../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import { validateContentMaxLength } from '../../../../../../_common/form-vue/validators';
import { FormValidatorContentNoMediaUpload } from '../../../../../../_common/form-vue/validators/content_no_media_upload';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppShortkey from '../../../../../../_common/shortkey/AppShortkey.vue';
import { useThemeStore } from '../../../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../../../_common/translate/AppTranslate.vue';
import {
	$gettext,
	$gettextInterpolate,
} from '../../../../../../_common/translate/translate.service';
import { useChatStore } from '../../../chat-store';
import { setMessageEditing, startTyping, stopTyping, tryGetRoomRole } from '../../../client';
import { ChatMessage, CHAT_MESSAGE_MAX_CONTENT_LENGTH } from '../../../message';
import { ChatRoom } from '../../../room';

export type FormModel = {
	content: string;
	id?: number;
};

const TYPING_TIMEOUT_INTERVAL = 3000;

// Allow images to be up to 100px in height so that image and a chat message fit
// into the editor without scrolling.
const displayRules = new ContentRules({ maxMediaWidth: 125, maxMediaHeight: 100 });
</script>

<script lang="ts" setup>
const props = defineProps({
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
});

const { room } = toRefs(props);

const emit = defineEmits({
	submit: (_content: FormModel) => true,
	cancel: () => true,
	focusChange: (_focused: boolean) => true,
});

const chatStore = useChatStore()!;
const themeStore = useThemeStore();

const focusToken = createFocusToken();

const isEditorFocused = ref(false);
const typing = ref(false);
const nextMessageTimeout = ref<NodeJS.Timer | null>(null);

let escapeCallback: EscapeStackCallback | null = null;
let typingTimeout: NodeJS.Timer | null = null;

const chat = computed(() => chatStore.chat!);

const contentEditorTempResourceContextData = computed(() => {
	if (chat.value && room.value) {
		return { roomId: room.value.id };
	}
	return undefined;
});

const shouldShiftEditor = computed(() => Screen.isXs && isEditorFocused);

const hasContent = computed(() => {
	const { content } = form.formModel;
	if (!content) {
		return false;
	}

	const doc = ContentDocument.fromJson(content);
	return doc.hasContent;
});

const isSendButtonDisabled = computed(() => {
	if (!form.valid || !hasContent.value || nextMessageTimeout.value !== null) {
		return true;
	}

	return !FormValidatorContentNoMediaUpload(form.formModel.content ?? '');
});

const isEditing = computed(() => !!chat.value.messageEditing);

const editorModelId = computed(() => form.formModel.id);

const typingText = computed(() => {
	const { roomMembers, currentUser } = chat.value;
	const usersOnline = roomMembers[room.value.id];
	if (!usersOnline || usersOnline.collection.length === 0) {
		return [];
	}

	const typingNames = usersOnline.collection
		.filter(user => user.typing)
		.filter(user => user.id !== currentUser?.id)
		.map(user => user.display_name);

	const displayNamePlaceholderValues = {
		user1: typingNames[0],
		user2: typingNames[1],
		user3: typingNames[2],
	};

	if (typingNames.length > 3) {
		return $gettext(`Several people are typing...`);
	} else if (typingNames.length === 3) {
		return $gettextInterpolate(
			`%{ user1 }, %{ user2 } and %{ user3 } are typing...`,
			displayNamePlaceholderValues
		);
	} else if (typingNames.length === 2) {
		return $gettextInterpolate(
			`%{ user1 } and %{ user2 } are typing...`,
			displayNamePlaceholderValues
		);
	} else if (typingNames.length === 1) {
		return $gettextInterpolate(`%{ user1 } is typing...`, displayNamePlaceholderValues);
	}

	return '';
});

watch(() => chat.value.messageEditing, onMessageEditing);

async function onMessageEditing(message: ChatMessage | null) {
	if (message) {
		form.formModel.content = message.content;
		form.formModel.id = message.id;

		// Wait in case the editor loses focus
		await nextTick();
		// Regain focus on the editor
		focusToken.focus();

		escapeCallback = () => cancelEditing();
		EscapeStack.register(escapeCallback);
	} else {
		if (escapeCallback) {
			EscapeStack.deregister(escapeCallback);
			escapeCallback = null;
		}
		cancelEditing();
	}
}

watch(() => room.value.id, onRoomChanged);

async function onRoomChanged() {
	if (form.formModel.content !== '') {
		// Clear out the editor when entering a new room.
		clearMsg();
	}

	// Then focus it.
	focusToken.focus();
}

const form: FormController<FormModel> = createForm({});

if (!import.meta.env.SSR) {
	form.warnOnDiscard = false;
	form.formModel.content = '';
}

onUnmounted(() => {
	if (typingTimeout) {
		clearTimeout(typingTimeout);
	}
});

async function submitMessage() {
	let doc;

	try {
		doc = ContentDocument.fromJson(form.formModel.content);
	} catch {
		// Tried submitting empty doc.
		return;
	}

	if (doc.hasContent) {
		const submit: FormModel = { content: form.formModel.content };
		if (isEditing.value) {
			submit.id = form.formModel.id;
		}

		emit('submit', submit);
		clearMsg();
	}
}

async function onSubmit() {
	if (!form.valid) {
		return;
	}

	if (nextMessageTimeout.value !== null) {
		return;
	}

	// Manually check for if media is uploading here.
	// We don't want to put the rule directly on the form cause showing form errors
	// for the media upload is sort of disruptive for chat messages.
	if (!FormValidatorContentNoMediaUpload(form.formModel.content)) {
		return;
	}

	await submitMessage();

	disableTypingTimeout();

	// Refocus editor after submitting message with enter.
	focusToken.focus();

	applyNextMessageTimeout();
}

function applyNextMessageTimeout() {
	// private
	if (!room.value.isFiresideRoom) {
		return;
	}

	const { currentUser } = chat.value;
	// For fireside rooms, timeout the user from sending another message for 1.5s.
	// Do not do this for the owner/mods.
	if (currentUser?.id === room.value.owner_id) {
		return;
	}

	if (currentUser) {
		const userRole = tryGetRoomRole(chat.value, room.value, currentUser);
		if (userRole === 'owner' || userRole === 'moderator') {
			return;
		}
	}

	nextMessageTimeout.value = setTimeout(() => {
		if (nextMessageTimeout.value) {
			clearTimeout(nextMessageTimeout.value);
			nextMessageTimeout.value = null;
		}
	}, 1500);
}

function onChange(_value: string) {
	if (!typing.value) {
		typing.value = true;
		startTyping(chat.value, room.value);
	} else if (typingTimeout) {
		clearTimeout(typingTimeout);
	}
	typingTimeout = setTimeout(disableTypingTimeout, TYPING_TIMEOUT_INTERVAL);
}

function onFocusEditor() {
	isEditorFocused.value = true;
	emit('focusChange', true);
}

function onBlurEditor() {
	isEditorFocused.value = false;
	emit('focusChange', false);
}

function onTabKeyPressed() {
	if (!isEditorFocused.value) {
		focusToken.focus();
	}
}

function onUpKeyPressed(event: KeyboardEvent) {
	if (isEditing.value || hasContent.value) {
		return;
	}
	const { messages, currentUser } = chat.value;

	// Find the last message sent by the current user.
	const userMessages = messages[room.value.id].filter(msg => msg.user.id === currentUser?.id);
	const lastMessage = userMessages[userMessages.length - 1];

	if (lastMessage) {
		// Prevent the "up" key press. This is to stop it from acting as a "go to beginning of line".
		// The content editor is focused immediately after this, and we want the editor to focus the end
		// of the content. This prevents it jump to the beginning of the line.
		event.preventDefault();

		setMessageEditing(chat.value, lastMessage);
	}
}

async function cancelEditing() {
	emit('cancel');
	setMessageEditing(chat.value, null);
	clearMsg();

	// Wait in case the editor loses focus
	await nextTick();
	// Regain focus on the editor
	focusToken.focus();
}

async function clearMsg() {
	form.formModel.content = '';
	form.formModel.id = undefined;

	// Wait for errors, then clear them.
	await nextTick();
	form.clearErrors();
}

function disableTypingTimeout() {
	typing.value = false;
	stopTyping(chat.value, room.value);
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
					:placeholder="$gettext('Send a message')"
					:single-line-mode="Screen.isDesktop"
					:validators="[validateContentMaxLength(CHAT_MESSAGE_MAX_CONTENT_LENGTH)]"
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

	::v-deep(.content-placeholder)
		text-overflow()
		max-width: 100%

	@media $media-xs
		border-bottom: 1px solid var(--theme-bg-subtle)

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
	min-width: 0

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
