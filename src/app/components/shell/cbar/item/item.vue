<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import { Screen } from '../../../../../_common/screen/screen-service';
import { useSidebarStore } from '../../../../../_common/sidebar/sidebar.store';
import { useAppStore } from '../../../../store';

@Options({})
export default class AppShellCbarItem extends Vue {
	@Prop({ type: Boolean, default: false }) isControl!: boolean;
	@Prop({ type: Boolean, default: false }) isActive!: boolean;
	@Prop({ type: Boolean, default: false }) isUnread!: boolean;
	@Prop(String) highlight?: string;
	@Prop({ type: Number, default: 0 }) notificationCount!: number;

	store = setup(() => useAppStore());
	sidebarStore = setup(() => useSidebarStore());

	get activeContextPane() {
		return this.sidebarStore.activeContextPane;
	}
	get visibleLeftPane() {
		return this.store.visibleLeftPane;
	}

	readonly Screen = Screen;

	get notificationCountText() {
		return this.notificationCount > 99 ? '99+' : formatNumber(this.notificationCount);
	}

	// We want a context indicator only for non-control items that are the current active item (selected or active route).
	get hasContextIndicator() {
		return !Screen.isLg && this.isActive && !this.isControl && this.activeContextPane;
	}

	// There can be two active items between the cbar controls and normal cbar items,
	// so we check the pane information to figure out what should be the active item visually.
	get showAsActive() {
		return (
			this.isActive &&
			(!this.visibleLeftPane || this.visibleLeftPane === 'context' || this.isControl)
		);
	}

	// Check what the actual active item is and if it's showing a pane.
	get isShowingPane() {
		return this.showAsActive && !!this.visibleLeftPane;
	}
}
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
			<app-jolticon icon="menu" />
		</div>
		<div v-if="notificationCount > 0" class="-notification-count">
			{{ notificationCountText }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

.-item
	display: block
	position: relative
	margin-bottom: $cbar-item-spacing
	width: $cbar-item-size
	height: $cbar-item-size

.-blip
.-notification-count
	pointer-events: none

.-blip
	position: absolute
	width: $cbar-blip-size
	height: $cbar-blip-size
	top: $cbar-blip-top
	left: -($cbar-blip-size * 2)
	background-color: var(--theme-lighter)
	border-radius: 50%
	will-change: height, top, left
	z-index: 2
	transition: height 300ms $ease-in-out-back, top 300ms $ease-in-out-back, left 300ms $ease-in-out-back, background-color 300ms

.-blip-unread
	left: $cbar-blip-left

.-blip-active
	top: 0
	left: $cbar-blip-left
	height: $cbar-item-size

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
