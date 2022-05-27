<script lang="ts">
import { transparentize } from 'polished';
import { computed, inject, PropType, reactive, ref, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { ContentRules } from '../../../../../_common/content/content-editor/content-rules';
import { ContentOwnerParentBounds } from '../../../../../_common/content/content-owner';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import { formatDate } from '../../../../../_common/filters/date';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { vAppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { DefaultTheme } from '../../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { ChatStore, ChatStoreKey } from '../../chat-store';
import {
	removeMessage as chatRemoveMessage,
	setMessageEditing,
	userCanModerateOtherUser,
} from '../../client';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';
import AppChatUserPopover from '../../user-popover/user-popover.vue';
import AppChatWindowOutputItemDetails from './AppChatWindowOutputItemDetails.vue';

export interface ChatMessageEditEvent {
	message: ChatMessage;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	message: {
		type: Object as PropType<ChatMessage>,
		required: true,
	},
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
});

const { message, room } = toRefs(props);

const chatStore = inject<ChatStore>(ChatStoreKey)!;
const { theme, isDark } = useThemeStore();

const displayRules = new ContentRules({ maxMediaWidth: 400, maxMediaHeight: 300 });

const root = ref<HTMLElement>();
const itemWrapper = ref<HTMLElement>();

const contentViewerBounds: ContentOwnerParentBounds = reactive({
	width: ref(200),
});

const chat = computed(() => chatStore.chat!);

// Use the form/page/user theme, or the default theme if none exist.
const actualTheme = computed(() => theme.value ?? DefaultTheme);

const isEditing = computed(() => chat.value.messageEditing === message.value);

/** The background-color for chat items that are being edited. */
const isEditingColor = computed(() => {
	if (!isEditing.value) {
		return undefined;
	}

	const highlight = '#' + actualTheme.value.highlight_;
	const backlight = '#' + actualTheme.value.backlight_;

	const tintColor = isDark.value ? highlight : backlight;
	return transparentize(0.65, tintColor);
});

const editingState = computed(() => {
	if (isEditing.value) {
		return {
			/** The text to display in the comment */
			display: '(editing...)',
			/** The tooltip to display on hover or tap */
			tooltip: '',
		};
	}

	if (message.value.edited_on) {
		return {
			display: '(edited)',
			tooltip: formatDate(message.value.edited_on!, 'medium'),
		};
	}

	return null;
});

const shouldShowMessageOptions = computed(() => canRemoveMessage.value || canEditMessage.value);

const dataAnchorWidth = computed(() => {
	const itemWidth = 40;
	if (isEditing.value) {
		return itemWidth;
	}

	let itemCount = 0;
	if (canRemoveMessage.value) {
		++itemCount;
	}
	if (canEditMessage.value) {
		++itemCount;
	}

	return itemWidth * itemCount + (itemCount - 1);
});

const canRemoveMessage = computed(() => {
	if (!chat.value.currentUser) {
		return false;
	}

	// The owner of the message can remove it.
	if (chat.value.currentUser.id === message.value.user.id) {
		return true;
	}

	// Mods/Room owners can also remove the message.
	return userCanModerateOtherUser(
		chat.value,
		room.value,
		chat.value.currentUser,
		message.value.user
	);
});

const canEditMessage = computed(() => {
	// Only content messages can be edited.
	if (message.value.type !== 'content') {
		return false;
	}

	if (!chat.value.currentUser) {
		return false;
	}

	// Only the owner of the message can edit.
	return chat.value.currentUser.id === message.value.user.id;
});

function startEdit() {
	setMessageEditing(chat.value, message.value);
	Popper.hideAll();
}

function stopEdit() {
	setMessageEditing(chat.value, null);
	Popper.hideAll();
}

async function removeMessage() {
	Popper.hideAll();

	const result = await ModalConfirm.show(
		$gettext(`Are you sure you want to remove this message?`)
	);

	if (!result) {
		return;
	}

	setMessageEditing(chat.value, null);
	chatRemoveMessage(chat.value, room.value, message.value.id);
}

let canClearFocus = false;
let isFocused = false;

async function onFocusItem() {
	isFocused = true;
	// Allow a second click to blur only after ~1/2 of our animations play.
	setTimeout(() => (canClearFocus = isFocused), 100);
}

function onBlurItem() {
	isFocused = false;
	canClearFocus = false;
}

async function onClickItem() {
	if (isFocused && canClearFocus) {
		itemWrapper.value?.blur();
	}
}

function onItemWrapperResize() {
	if (!itemWrapper.value) {
		return;
	}

	const { offsetWidth } = itemWrapper.value;
	const decoratorPadding = 12 * 2;
	contentViewerBounds.width = Math.max(offsetWidth - decoratorPadding, 100);
}
</script>

<template>
	<div
		ref="root"
		class="chat-window-output-item"
		:class="{
			'-message-queued': message._showAsQueued,
			'-message-editing': isEditing,
		}"
	>
		<a v-if="message.showAvatar" class="-avatar">
			<AppPopper placement="right">
				<img
					class="-avatar-img img-responsive"
					:src="message.user.img_avatar"
					alt=""
					draggable="false"
				/>

				<template #popover>
					<AppChatUserPopover :user="message.user" :room="room" />
				</template>
			</AppPopper>
		</a>

		<div
			ref="itemWrapper"
			v-app-observe-dimensions="onItemWrapperResize"
			class="-item-container-wrapper"
			tabindex="-1"
			@focus="onFocusItem"
			@blur="onBlurItem"
			@click.capture="onClickItem"
		>
			<div class="-item-container">
				<div
					class="-item-decorator"
					:style="{
						'background-image': isEditingColor
							? `linear-gradient(${isEditingColor}, ${isEditingColor}`
							: undefined,
					}"
				>
					<div v-if="message.showMeta" class="-item-byline">
						<RouterLink class="-user link-unstyled" :to="message.user.url">
							{{ message.user.display_name }}
						</RouterLink>
						<span class="-username"> @{{ message.user.username }} </span>
						<span>
							<AppChatWindowOutputItemDetails
								:message="message"
								:room="room"
								:timestamp-margin-left="8"
								show-am-pm
							/>
						</span>
					</div>

					<AppContentViewer
						:source="message.content"
						:display-rules="displayRules"
						:parent-bounds="contentViewerBounds"
					/>

					<span
						v-if="editingState"
						v-app-tooltip.touchable="editingState.tooltip"
						class="-edited"
						:class="{ 'text-muted': !isEditing }"
					>
						<AppTranslate>{{ editingState.display }}</AppTranslate>
					</span>
				</div>

				<div v-if="!message.showMeta" class="-floating-data-left">
					<AppChatWindowOutputItemDetails :message="message" :room="room" />
				</div>

				<div
					class="-floating-data-anchor"
					:style="{
						width: dataAnchorWidth + 'px',
					}"
				>
					<div v-if="shouldShowMessageOptions" class="-floating-data-right">
						<div class="-message-actions">
							<template v-if="isEditing">
								<a
									v-app-tooltip="$gettext('Cancel edit')"
									class="-message-actions-item link-unstyled"
									@click="stopEdit"
								>
									<AppJolticon icon="remove" />
								</a>
							</template>
							<template v-else>
								<a
									v-if="canEditMessage"
									v-app-tooltip="$gettext('Edit message')"
									class="-message-actions-item link-unstyled"
									@click="startEdit"
								>
									<AppJolticon icon="edit" />
								</a>

								<a
									v-if="canRemoveMessage"
									v-app-tooltip="$gettext('Remove message')"
									class="-message-actions-item link-unstyled"
									@click="removeMessage"
								>
									<!-- TODO(chat-backgrounds) trash jolticon -->
									<AppJolticon icon="remove" />
								</a>
							</template>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

$-min-item-width = 24px

.chat-window-output-item
	position: relative
	margin-bottom: 4px

	@media $media-xs
		font-size: $font-size-small
		line-height: $font-size-small * 1.25

	// Some different styling for the fade collapse.
	::v-deep(.fade-collapse-collapsed)
		theme-prop('border-bottom-color', 'light')
		margin-bottom: 4px
		border-bottom-width: $border-width-base
		border-bottom-style: dashed

		&::before
			theme-prop('background', 'darker', true)
			max-height: 4px !important

.-avatar
	position: absolute
	left: 0
	bottom: 0
	width: $avatar-size
	height: $avatar-size
	z-index: 1

	.-avatar-img
		img-circle()
		elevate-1()

.-item-container-wrapper
	display: flex
	align-items: flex-start
	outline: 0
	margin-left: $left-gutter-size
	flex: auto
	min-width: 0

	@media $media-xs
		// On small screens, reduce the left side margin to make more space for the actual messages.
		margin-left: $avatar-size + 12px

.-item-container
	position: relative
	display: inline-flex
	min-width: $-min-item-width

.-item-decorator
	rounded-corners-lg()
	elevate-1()
	display: inline-block
	padding: 12px
	background-color: var(--theme-bg)
	z-index: 1
	max-width: 100%

.-floating-data-anchor
	position: relative
	flex: 1 1 0px
	z-index: 2

.-item-byline
	display: flex
	align-items: center
	margin-bottom: 4px

.-user
	text-overflow()
	max-width: 200px
	font-weight: bold
	font-size: 13px

.-username
	theme-prop('color', 'fg-muted')
	font-size: 11px
	margin-left: 4px
	cursor: default

.-message-details
	theme-prop('color', 'fg-muted')
	font-size: 11px
	cursor: default

.-message-queued
	color: var(--theme-fg-muted)

	::v-deep(.content-image)
		filter: grayscale(0.75) brightness(0.9)

	::v-deep(.emoji)
		filter: grayscale(1) brightness(0.9)

	::v-deep(.content-gif)
		filter: grayscale(0.75) brightness(0.9)

.-edited
	font-size: $font-size-tiny
	cursor: default
	user-select: none

.-floating-data-left
.-floating-data-right
	top: 0
	white-space: nowrap
	opacity: 0
	z-index: 0
	display: inline-flex
	flex-direction: row
	gap: 8px
	align-items: center
	transition-property: opacity, transform, visibility
	transition-duration: 200ms
	transition-timing-function: $weak-ease-out
	visibility: hidden

.-floating-data-left
	position: absolute
	right: 100%
	transform: translateX(50%)
	width: $left-gutter-size + $chat-room-window-padding-h
	display: flex
	justify-content: center

.-floating-data-right
	position: absolute
	top: -2px
	right: -4px
	transform: translateX(50%)

.-message-actions
	rounded-corners()
	change-bg(bg-backdrop)
	elevate-1()
	overflow: hidden
	display: inline-flex
	flex-wrap: nowrap
	grid-template-columns: repeat(auto-fit, 1fr)

.-message-actions-item
	border-right: 1px solid var(--theme-bg-subtle)
	width: 41px
	display: inline-flex
	align-items: center
	justify-content: center
	padding: 8.5px 0

	&:hover
		background-color: unquote('rgba(var(--theme-fg-rgb), 0.1)')

	&:last-child
		border-right: none
		width: 40px

	::v-deep(.jolticon)
		font-size: 16px
		margin: 0

// Desktop (mouse)
@media not screen and (pointer: coarse)
	.-item-container:hover
	.-item-container-wrapper:hover
	.-message-queued
	.-message-editing
		.-message-details
			visibility: visible

		.-floating-data-left
		.-floating-data-right
			transform: translateX(0%)
			opacity: 1
			visibility: visible

			::v-deep(.jolticon)
				margin: 0
				overlay-text-shadow()

// Mobile (touch)
@media screen and (pointer: coarse)
	.-item-container:focus-within
	.-item-container-wrapper:focus-within
	.-message-queued
	.-message-editing
		.-message-details
			visibility: visible

		.-floating-data-left
		.-floating-data-right
			transform: translateX(0%)
			opacity: 1
			visibility: visible

			::v-deep(.jolticon)
				margin: 0
				overlay-text-shadow()
</style>
