<script lang="ts">
export interface ChatMessageEditEvent {
	message: ChatMessage;
}

const InviewConfig = new ScrollInviewConfig();

const DisplayRules = new ContentRules({ maxMediaWidth: 400, maxMediaHeight: 300 });
</script>

<script lang="ts" setup>
import { computed, PropType, reactive, ref, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { ContentRules } from '../../../../../_common/content/content-editor/content-rules';
import { ContentOwnerParentBounds } from '../../../../../_common/content/content-owner';
import AppContentViewer from '../../../../../_common/content/content-viewer/AppContentViewer.vue';
import { formatDate } from '../../../../../_common/filters/date';
import AppJolticon, { Jolticon } from '../../../../../_common/jolticon/AppJolticon.vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import AppPopper, { PopperPlacementType } from '../../../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { useGridStore } from '../../../grid/grid-store';
import {
	removeMessage as chatRemoveMessage,
	retryFailedQueuedMessage,
	setMessageEditing,
	userCanModerateOtherUser,
} from '../../client';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';
import { getChatUserRoleData } from '../../user';
import AppChatUserPopover from '../../user-popover/user-popover.vue';
import AppChatWindowOutputItemTime from './AppChatWindowOutputItemTime.vue';

const props = defineProps({
	message: {
		type: Object as PropType<ChatMessage>,
		required: true,
	},
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
	messagePadding: {
		type: Number,
		default: 12,
	},
	maxContentWidth: {
		type: Number,
		default: 100,
	},
	avatarPopperPlacement: {
		type: String as PropType<PopperPlacementType>,
		default: 'right',
	},
	avatarPopperPlacementFallbacks: {
		type: Array as PropType<PopperPlacementType[]>,
		default: undefined,
	},
});

const emit = defineEmits({
	showPopper: () => true,
	hidePopper: () => true,
});

const { message, room, maxContentWidth } = toRefs(props);
const { chatUnsafe: chat } = useGridStore();

let canClearFocus = false;
let isFocused = false;

const root = ref<HTMLElement>();
const itemWrapper = ref<HTMLElement>();
const isShowingAvatarPopper = ref(false);
const popperHideTrigger = ref(0);

const contentViewerBounds: ContentOwnerParentBounds = reactive({
	width: maxContentWidth,
});

const showAsQueued = computed(() => message.value._showAsQueued);
const hasError = computed(() => !!message.value._error);
const isEditing = computed(() => chat.value.messageEditing === message.value);

const messageState = computed<{ icon?: Jolticon; display: string; tooltip?: string } | null>(() => {
	const wrap = (text: string) => `(${text})`;

	if (showAsQueued.value) {
		return {
			icon: 'broadcast',
			display: wrap($gettext('sending...')),
		};
	}

	if (hasError.value) {
		return {
			icon: 'notice',
			display: $gettext('Failed to send. Press to retry'),
		};
	}

	if (isEditing.value) {
		return {
			display: wrap($gettext('editing...')),
		};
	}

	if (message.value.edited_on) {
		return {
			display: wrap($gettext('edited')),
			tooltip: formatDate(message.value.edited_on!, 'medium'),
		};
	}

	return null;
});

const shouldShowMessageOptions = computed(() => canRemoveMessage.value || canEditMessage.value);

const dataAnchorWidth = computed(() => {
	const itemWidth = 40;
	/** The border and spacing added between items. */
	const itemSpacerWidth = 1;

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
	if (!itemCount) {
		return 0;
	}

	const itemWidthTotal = itemWidth * itemCount;
	const spacerWidthTotal = itemSpacerWidth * (itemCount - 1);
	return itemWidthTotal + spacerWidthTotal;
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
	if (message.value.is_automated) {
		return false;
	}

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

const roleData = computed(() =>
	getChatUserRoleData(chat.value, room.value, message.value.user, {
		mesage: message.value,
	})
);

const shouldShowAvatar = computed(
	() => message.value.showAvatar === true || isShowingAvatarPopper.value
);

function onAvatarPopperVisible(isShowing: boolean) {
	isShowingAvatarPopper.value = isShowing;

	if (!isShowing) {
		emit('hidePopper');
	} else {
		emit('showPopper');
	}
}

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

async function onFocusItem() {
	isFocused = true;
	// Allow a second click to blur only after ~1/2 of our animations play.
	setTimeout(() => (canClearFocus = isFocused), 100);
}

function onBlurItem() {
	isFocused = false;
	canClearFocus = false;
}

function onRowClick() {
	if (isFocused && canClearFocus) {
		itemWrapper.value?.blur();
	}
}

async function onMessageClick() {
	if (hasError.value) {
		retryFailedQueuedMessage(chat.value, message.value);
	}
}
</script>

<template>
	<div
		ref="root"
		class="chat-window-output-item"
		:class="{
			'-message-queued': showAsQueued,
			'-message-editing': isEditing,
		}"
	>
		<AppScrollInview
			v-if="shouldShowAvatar"
			class="-avatar"
			tag="a"
			:config="InviewConfig"
			@outview="isShowingAvatarPopper ? ++popperHideTrigger : undefined"
		>
			<AppPopper
				:placement="avatarPopperPlacement"
				:fallback-placements="avatarPopperPlacementFallbacks"
				:hide-trigger="popperHideTrigger"
				@show="onAvatarPopperVisible(true)"
				@hide="onAvatarPopperVisible(false)"
			>
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
		</AppScrollInview>

		<div
			ref="itemWrapper"
			class="-item-container-wrapper"
			tabindex="-1"
			@focus="onFocusItem"
			@blur="onBlurItem"
			@click.capture="onRowClick"
		>
			<div class="-item-container">
				<div
					class="-item-decorator"
					:style="{
						opacity: showAsQueued ? 0.7 : 1,
						cursor: hasError ? 'pointer' : undefined,
						padding: messagePadding + 'px',
					}"
					@click="onMessageClick"
				>
					<div
						class="-item-decorator-border"
						:class="{
							'-primary-border': isEditing,
						}"
					/>

					<span
						v-if="(message.showMeta || message.is_automated) && roleData"
						v-app-tooltip="roleData.tooltip"
						class="-role"
					>
						<AppJolticon class="-role-icon" :icon="roleData.icon" />
					</span>

					<div v-if="message.showMeta" class="-item-byline">
						<RouterLink class="-user link-unstyled" :to="message.user.url">
							{{ message.user.display_name }}
						</RouterLink>
						<span class="-username"> @{{ message.user.username }} </span>
						<span>
							<AppChatWindowOutputItemTime
								:message="message"
								:room="room"
								:timestamp-margin-left="8"
								show-am-pm
							/>
						</span>
					</div>

					<AppContentViewer
						:source="message.content"
						:display-rules="DisplayRules"
						:parent-bounds="contentViewerBounds"
					/>

					<span
						v-if="messageState"
						v-app-tooltip.touchable="messageState.tooltip"
						class="-message-state"
						:class="{ 'text-muted': !isEditing }"
					>
						<AppJolticon v-if="messageState.icon" :icon="messageState.icon" />
						<AppTranslate>{{ messageState.display }}</AppTranslate>
					</span>
				</div>

				<div v-if="!message.showMeta" class="-floating-data-left">
					<AppChatWindowOutputItemTime
						:class="{ '-overlay-text': !!room.background }"
						:message="message"
						:room="room"
					/>
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
									class="-message-actions-item"
									@click="stopEdit"
								>
									<AppJolticon icon="remove" />
								</a>
							</template>
							<template v-else>
								<a
									v-if="canEditMessage"
									v-app-tooltip="$gettext('Edit message')"
									class="-message-actions-item"
									@click="startEdit"
								>
									<AppJolticon icon="edit" />
								</a>

								<a
									v-if="canRemoveMessage"
									v-app-tooltip="$gettext('Remove message')"
									class="-message-actions-item"
									@click="removeMessage"
								>
									<AppJolticon icon="trash-can" />
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
	position: relative
	background-color: var(--theme-bg)
	z-index: 1
	max-width: 100%

.-item-decorator-border
	position: absolute
	border-radius: inherit
	left: -1px
	top: @left
	right: @left
	bottom: @left
	border-width: $border-width-large
	border-style: solid
	border-color: transparent
	z-index: 1
	pointer-events: none

.-primary-border
	border-color: var(--theme-primary)

.-floating-data-anchor
	position: relative
	flex: 1 1 0px
	z-index: 2

.-item-byline
	display: flex
	align-items: center
	margin-bottom: 4px

.-role
	img-circle()
	change-bg(bg)
	elevate-1()
	position: absolute
	left: 0
	top: 0
	transform: translate(-25%, -25%)
	width: 20px
	height: 20px
	z-index: 1

.-role-icon
	font-size: 13px
	position: absolute
	color: var(--theme-primary)
	left: 50%
	top: 50%
	transform: translate(-50%, -50%)
	margin: 0

.-user
	text-overflow()
	max-width: 200px
	font-weight: bold
	font-size: 13px
	flex: 0 1 auto

.-username
	text-overflow()
	theme-prop('color', 'fg-muted')
	font-size: 11px
	margin-left: 4px
	cursor: default
	flex: 0 1 auto

.-message-queued
	color: var(--theme-fg-muted)

	::v-deep(.content-image)
		filter: grayscale(0.75) brightness(0.9)

	::v-deep(.emoji)
		filter: grayscale(1) brightness(0.9)

	::v-deep(.content-gif)
		filter: grayscale(0.75) brightness(0.9)

.-message-state
	cursor: default
	user-select: none

	::v-deep(.jolticon)
		margin-right: 4px

	&
	::v-deep(.jolticon)
		font-size: $font-size-tiny

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
	transform: translate3d(-50%, 0, 0)
	width: $left-gutter-size + $chat-room-window-padding-h
	display: flex
	justify-content: center

.-floating-data-right
	position: absolute
	top: -2px
	right: -4px
	transform: translate3d(50%, 0, 0)

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
	color: var(--theme-fg)
	text-decoration: none

	&:hover
		background-color: unquote('rgba(var(--theme-fg-rgb), 0.1)')

	&:last-child
		border-right: none
		width: 40px

	::v-deep(.jolticon)
		font-size: 16px
		margin: 0

.-overlay-text
	color: white
	overlay-text-shadow()

// Desktop (mouse)
@media not screen and (pointer: coarse)
	.-item-container:hover
	.-item-container-wrapper:hover
	.-message-editing
		.-floating-data-left
		.-floating-data-right
			transform: translate3d(0, 0, 0)
			opacity: 1
			visibility: visible

			::v-deep(.jolticon)
				margin: 0
				overlay-text-shadow()

// Mobile (touch)
@media screen and (pointer: coarse)
	.-item-container:focus-within
	.-item-container-wrapper:focus-within
	.-message-editing
		.-floating-data-left
		.-floating-data-right
			transform: translate3d(0, 0, 0)
			opacity: 1
			visibility: visible

			::v-deep(.jolticon)
				margin: 0
				overlay-text-shadow()
</style>
