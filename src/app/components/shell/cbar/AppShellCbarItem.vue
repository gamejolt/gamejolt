<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { useSidebarStore } from '../../../../_common/sidebar/sidebar.store';
import { useAppStore } from '../../../store';

const props = defineProps({
	isControl: {
		type: Boolean,
	},
	isActive: {
		type: Boolean,
	},
	isUnread: {
		type: Boolean,
	},
	highlight: {
		type: String,
		default: undefined,
	},
	notificationCount: {
		type: Number,
		default: 0,
	},
});

const { isControl, isActive, notificationCount } = toRefs(props);
const { visibleLeftPane } = useAppStore();
const { activeContextPane } = useSidebarStore();

const notificationCountText = computed(() => {
	if (notificationCount.value > 99) {
		return '99+';
	}

	return formatNumber(notificationCount.value);
});

// We want a context indicator only for non-control items that are the current
// active item (selected or active route).
const hasContextIndicator = computed(
	() => !Screen.isLg && isActive.value && !isControl.value && activeContextPane.value
);

// There can be two active items between the cbar controls and normal cbar
// items, so we check the pane information to figure out what should be the
// active item visually.
const showAsActive = computed(() => {
	if (!isActive.value) {
		return false;
	}

	return !visibleLeftPane.value || visibleLeftPane.value === 'context' || isControl.value;
});

// Check what the actual active item is and if it's showing a pane.
const isShowingPane = computed(() => showAsActive.value && !!visibleLeftPane.value);
</script>

<template>
	<div class="-item">
		<slot />
		<div
			class="-blip"
			:class="{
				'-blip-unread': isUnread,
				'-blip-active': showAsActive,
			}"
			:style="{
				'background-color': highlight,
			}"
		/>
		<div
			v-if="hasContextIndicator"
			class="-context-indicator"
			:class="{ '-showing': isShowingPane }"
		>
			<AppJolticon icon="menu" />
		</div>
		<div v-if="notificationCount > 0" class="-notification-count">
			{{ notificationCountText }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-item
	display: block
	position: relative
	margin-bottom: var(--cbar-item-spacing)
	width: var(--cbar-item-size)
	height: var(--cbar-item-size)

.-blip
.-notification-count
	pointer-events: none

.-blip
	position: absolute
	width: var(--cbar-blip-size)
	height: var(--cbar-blip-size)
	top: var(--cbar-blip-top)
	left: calc(var(--cbar-blip-size) * -2)
	background-color: var(--theme-lighter)
	border-radius: 50%
	will-change: height, top, left
	z-index: 2
	transition: height 300ms $ease-in-out-back, top 300ms $ease-in-out-back, left 300ms $ease-in-out-back, background-color 300ms

.-blip-unread
	left: var(--cbar-blip-left)

.-blip-active
	top: 0
	left: var(--cbar-blip-left)
	height: var(--cbar-item-size)

.-notification-count
.-context-indicator
	position: absolute
	right: -2px
	z-index: 2
	border-color: var(--theme-darkest)
	border-width: 3px
	border-style: solid
	font-size: $font-size-tiny
	text-align: center

.-notification-count
	border-radius: 10px
	bottom: -2px
	padding-left: 4px
	padding-right: 4px
	font-weight: bolder
	color: var(--theme-highlight-fg)
	background-color: var(--theme-highlight)

.-context-indicator
	img-circle()
	cursor: pointer
	top: -2px
	padding: 2px
	color: var(--theme-lighter)
	background-color: var(--theme-dark)
	transition: opacity 300ms, visibility 300ms
	transition-timing-function: $strong-ease-out

	::v-deep(.jolticon)
		font-size: $font-size-tiny
		vertical-align: middle

	&.-showing
		opacity: 0
		visibility: hidden
</style>
