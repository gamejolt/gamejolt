<script lang="ts">
export type FormModel = {
	content: string;
	id?: number;
};

const TYPING_TIMEOUT_INTERVAL = 3000;
</script>

<script lang="ts" setup>
import { computed, nextTick, onUnmounted, PropType, ref, toRefs, watch } from 'vue';
import { createFocusToken } from '../../../../../utils/focus-token';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { ContextCapabilities } from '../../../../../_common/content/content-context';
import { ContentDocument } from '../../../../../_common/content/content-document';
import { ContentRules } from '../../../../../_common/content/content-editor/content-rules';
import {
	EscapeStack,
	EscapeStackCallback,
} from '../../../../../_common/escape-stack/escape-stack.service';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import { validateContentMaxLength } from '../../../../../_common/form-vue/validators';
import { FormValidatorContentNoMediaUpload } from '../../../../../_common/form-vue/validators/content_no_media_upload';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppShortkey from '../../../../../_common/shortkey/AppShortkey.vue';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext, $gettextInterpolate } from '../../../../../_common/translate/translate.service';
import { useGridStore } from '../../../grid/grid-store';
import {
	editMessage as chatEditMessage,
	queueChatMessage,
	setMessageEditing,
	startTyping,
	stopTyping,
	tryGetRoomRole,
} from '../../client';
import { ChatMessage, CHAT_MESSAGE_MAX_CONTENT_LENGTH } from '../../message';
import { ChatRoom } from '../../room';

// Allow images to be up to 100px in height so that image and a chat message fit
// into the editor without scrolling.
const displayRules = new ContentRules({ maxMediaWidth: 125, maxMediaHeight: 100 });

const props = defineProps({
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
	/**
	 * Optional if needed to do custom overrides (such as firesides with roles).
	 */
	contextCapabilities: {
		type: Object as PropType<ContextCapabilities>,
		default: undefined,
	},
	/** Duration in milliseconds */
	slowmodeDuration: {
		type: Number,
		default: 2_000,
	},
	maxContentLength: {
		type: Number,
		default: CHAT_MESSAGE_MAX_CONTENT_LENGTH,
	},
});

const emit = defineEmits({
	'focus-change': (_focused: boolean) => true,
});

const { room, slowmodeDuration } = toRefs(props);

const { isDark } = useThemeStore();
const { chatUnsafe: chat } = useGridStore();

const focusToken = createFocusToken();

const isEditorFocused = ref(false);
const typing = ref(false);

const nextMessageTimeout = ref<NodeJS.Timer | null>(null);
let lastMessageTimestamp: number | null = null;

let escapeCallback: EscapeStackCallback | null = null;
let typingTimeout: NodeJS.Timer | null = null;

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
	const { currentUser } = chat.value;
	const memberCollection = room.value.memberCollection;
	if (memberCollection.count === 0) {
		return [];
	}

	const typingNames = memberCollection.users
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

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		form.formModel.content = '';
	},
});

onUnmounted(() => {
	if (typingTimeout) {
		clearTimeout(typingTimeout);
	}
});

watch(
	() => chat.value.messageEditing,
	async (message: ChatMessage | null) => {
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
);

watch(
	() => room.value.id,
	async () => {
		if (form.formModel.content !== '') {
			// Clear out the editor when entering a new room.
			clearMsg();
		}

		// Then focus it.
		focusToken.focus();
	}
);

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
		queueChatMessage(room.value, 'content', contentJson);
	}
}

async function onRoomChanged() {
	setMessageEditing(chat.value, null);
}

async function submitMessage() {
	let doc;

	try {
		doc = ContentDocument.fromJson(form.formModel.content);
	} catch {
		// Tried submitting empty doc.
		return;
	}

	if (doc.hasContent) {
		const data: FormModel = { content: form.formModel.content };
		if (isEditing.value) {
			data.id = form.formModel.id;
		}

		if (chat.value.messageEditing) {
			editMessage(data);
		} else {
			sendMessage(data);
		}
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

	lastMessageTimestamp = Date.now();
	applyNextMessageTimeout({ ignoreLastMessageTimestamp: true });
}

watch(slowmodeDuration, () => applyNextMessageTimeout({ ignoreLastMessageTimestamp: false }));

function applyNextMessageTimeout(options: { ignoreLastMessageTimestamp: boolean }) {
	if (!slowmodeDuration.value) {
		if (nextMessageTimeout.value) {
			clearTimeout(nextMessageTimeout.value);
			nextMessageTimeout.value = null;
		}
		return;
	}

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
		const userRole = tryGetRoomRole(room.value, currentUser);
		if (userRole === 'owner' || userRole === 'moderator') {
			return;
		}
	}

	let duration = slowmodeDuration.value;

	if (!options.ignoreLastMessageTimestamp && lastMessageTimestamp) {
		const timeSinceLastMessage = Date.now() - lastMessageTimestamp;

		if (timeSinceLastMessage > duration) {
			if (nextMessageTimeout.value) {
				clearTimeout(nextMessageTimeout.value);
				nextMessageTimeout.value = null;
			}
			return;
		} else {
			duration -= timeSinceLastMessage;
		}
	}

	if (duration <= 0) {
		return;
	}

	if (nextMessageTimeout.value) {
		clearTimeout(nextMessageTimeout.value);
	}

	nextMessageTimeout.value = setTimeout(() => {
		if (nextMessageTimeout.value) {
			clearTimeout(nextMessageTimeout.value);
			nextMessageTimeout.value = null;
		}
	}, duration);
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
	emit('focus-change', true);
}

function onBlurEditor() {
	isEditorFocused.value = false;
	emit('focus-change', false);
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
	const { currentUser } = chat.value;
	const { messages } = room.value;

	// Find the last message sent by the current user.
	const userMessages = messages.filter(i => i.user.id === currentUser?.id);
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
	<div class="chat-window-send">
		<div class="-container">
			<AppForm :controller="form">
				<AppShortkey shortkey="tab" @press="onTabKeyPressed" />

				<transition name="fade">
					<div
						v-if="!!typingText || isEditing"
						class="-top-indicators"
						:class="{
							'-light-mode': !isDark,
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
							:context-capabilities-override="contextCapabilities"
							:temp-resource-context-data="contentEditorTempResourceContextData"
							:placeholder="$gettext('Send a message')"
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
							v-app-tooltip="
								isEditing ? $gettext(`Edit message`) : $gettext(`Send message`)
							"
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
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

$-button-width = 40px
$-button-height = 40px

.-container
	position: relative

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
