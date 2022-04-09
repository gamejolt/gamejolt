<script lang="ts">
import { nextTick } from 'vue';
import { Options, Vue, Watch } from 'vue-property-decorator';
import AppEventItemMediaIndicator from '../../../app/components/event-item/media-indicator/media-indicator.vue';
import { shallowSetup } from '../../../utils/vue';
import { Analytics } from '../../analytics/analytics.service';
import {
	setDrawerOpen,
	setDrawerStoreActiveItem,
	setDrawerStoreHeight,
	useDrawerStore,
} from '../../drawer/drawer-store';
import { EscapeStack, EscapeStackCallback } from '../../escape-stack/escape-stack.service';
import AppLoadingFade from '../../loading/AppLoadingFade.vue';
import { onScreenResize, Screen } from '../../screen/screen-service';
import AppScrollScroller from '../../scroll/AppScrollScroller.vue';
import { useEventSubscription } from '../../system/event/event-topic';
import AppTouch, { AppTouchInput } from '../../touch/AppTouch.vue';
import AppStickerCard from '../card/AppStickerCard.vue';
import { Sticker, StickerStack } from '../sticker.model';
import AppSticker from '../sticker.vue';
import AppStickerLayerDrawerItem from './AppStickerLayerDrawerItem.vue';

@Options({
	components: {
		AppScrollScroller,
		AppStickerCard,
		AppSticker,
		AppStickerLayerDrawerItem,
		AppLoadingFade,
		AppEventItemMediaIndicator,
	},
})
export default class AppStickerLayerDrawer extends Vue {
	drawerStore = shallowSetup(() => useDrawerStore());

	sheetPage = 1;
	isSwiping = false;
	private stickersPerRow = 5;
	private touchedSticker: Sticker | null = null;
	private escapeCallback?: EscapeStackCallback;

	private readonly drawerPadding = 8;
	private readonly stickerSpacing = 8;
	readonly Screen = Screen;

	declare $el: HTMLDivElement;

	declare $refs: {
		content: HTMLDivElement;
		slider: HTMLDivElement;
	};

	get stickerSize() {
		return this.drawerStickerSize + this.stickerSpacing;
	}

	get drawerStickerSize() {
		return this.drawerStore.stickerSize.value;
	}

	get hasLoaded() {
		return this.drawerStore.hasLoaded.value;
	}

	get drawerNavigationComponent() {
		if (Screen.isPointerMouse) {
			return 'div';
		} else {
			return AppTouch;
		}
	}

	get drawerNavigationProps() {
		if (!Screen.isPointerMouse) {
			return {
				'pan-options': { threshold: 16 },
			};
		}
		return {};
	}

	get stickerSheets() {
		return this.chunkStickers(this.items);
	}

	private chunkStickers(stickers: StickerStack[]) {
		const sheets = [];

		let current: StickerStack[] = [];
		for (const i of stickers) {
			current.push(i);

			if (current.length >= this.maxStickersPerSheet) {
				sheets.push(current);
				current = [];
			}
		}

		if (current.length > 0) {
			sheets.push(current);
		}

		return sheets;
	}

	get isLoading() {
		return this.drawerStore.isLoading.value;
	}

	get items() {
		return this.drawerStore.drawerItems.value;
	}

	get hasStickers() {
		return !!this.items.length;
	}

	get maxStickersPerSheet() {
		if (Screen.isPointerMouse) {
			// Don't worry, this is SAFE.
			return Number.MAX_SAFE_INTEGER;
		}

		const rows = 2;
		return this.stickersPerRow * rows;
	}

	get styles() {
		const numRowsShowing = Screen.isPointerMouse ? 2.3 : 2;
		const { drawerHeight, sticker, stickerSize, isDragging, isHoveringDrawer } =
			this.drawerStore;

		return {
			shell: [
				{
					transform: `translateY(0)`,
					left: Screen.isXs ? 0 : '64px',
					// Max-height of 2 sticker rows
					maxHeight: Screen.isPointerMouse
						? `${this.drawerPadding * 2 + this.stickerSize * numRowsShowing}px`
						: null,
				},
				// Shift the drawer down when there's an item being dragged and the drawer container is not being hovered.
				sticker.value && !isHoveringDrawer.value
					? {
							transform: `translateY(${
								drawerHeight.value - stickerSize.value / 2
							}px)`,
					  }
					: null,
			],
			outer: {
				cursor: isDragging.value ? 'grabbing' : 'default',
				paddingTop: `${this.drawerPadding}px`,
				// Max-width is unset when Xs (so it can bleed and span the whole width), with margins of 64px on other breakpoints.
				maxWidth: Screen.isXs ? 'unset' : `calc(100% - 64px)`,
				// Max-height of 2 sticker rows
				maxHeight: Screen.isPointerMouse
					? this.drawerPadding * 2 + this.stickerSize * numRowsShowing + 'px'
					: null,
			},
			dimensions: {
				minWidth: Screen.isXs ? 'unset' : '400px',
				minHeight: `${this.stickerSize}px`,
				maxHeight: Screen.isPointerMouse
					? this.drawerPadding + this.stickerSize * numRowsShowing + 'px'
					: undefined,
				paddingBottom: `${this.drawerPadding}px`,
			},
			sheet: {
				padding: `0 ${this.drawerPadding}px`,
				width: `100%`,
				height: `100%`,
			},
			stickers: {
				padding: '4px',
				marginRight: this.stickerSpacing + 'px',
				marginBottom: this.stickerSpacing + 'px',
			},
		};
	}

	created() {
		useEventSubscription(onScreenResize, () => this.calculateStickersPerRow());
	}

	mounted() {
		this.calculateStickersPerRow();

		this.escapeCallback = () => setDrawerOpen(this.drawerStore, false);
		EscapeStack.register(this.escapeCallback);
	}

	beforeUnmount() {
		if (this.escapeCallback) {
			EscapeStack.deregister(this.escapeCallback);
			this.escapeCallback = undefined;
		}
	}

	onClickMargin() {
		setDrawerOpen(this.drawerStore, false);
	}

	// VueTouch things - START
	goNext() {
		if (this.sheetPage >= this.stickerSheets.length) {
			this._updateSliderOffset();
			return;
		}

		this.sheetPage = Math.min(this.sheetPage + 1, this.stickerSheets.length);
		Analytics.trackEvent('sticker-drawer', 'swipe-next');
		this._updateSliderOffset();
	}

	goPrev() {
		if (this.sheetPage <= 1) {
			this._updateSliderOffset();
			return;
		}

		this.sheetPage = Math.max(this.sheetPage - 1, 1);
		Analytics.trackEvent('sticker-drawer', 'swipe-previous');
		this._updateSliderOffset();
	}

	assignTouchedSticker(sticker: StickerStack) {
		if (
			!this.drawerStore.isDrawerOpen.value ||
			this.drawerStore.sticker.value ||
			sticker.count <= 0
		) {
			return;
		}

		this.touchedSticker = sticker.sticker;
	}

	onMouseMove(event: MouseEvent) {
		if (!this.touchedSticker) {
			return;
		}

		setDrawerStoreActiveItem(this.drawerStore, this.touchedSticker, event);
		this.resetTouchedSticker();
	}

	resetTouchedSticker() {
		this.touchedSticker = null;
	}

	panStart(event: AppTouchInput) {
		const { deltaX, deltaY } = event;
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			this.isSwiping = true;
		} else if (this.touchedSticker) {
			setDrawerStoreActiveItem(this.drawerStore, this.touchedSticker, event.pointer);
		} else {
			return false;
		}
	}

	pan(event: AppTouchInput) {
		if (this.drawerStore.isDragging.value) {
			this.isSwiping = false;
			return;
		}

		// In case the animation frame was retrieved after we stopped dragging.
		if (!this.isSwiping) {
			return;
		}

		this._updateSliderOffset(event.deltaX);
	}

	panEnd(event: AppTouchInput) {
		this.isSwiping = false;

		// Make sure we moved at a high enough velocity and/or distance to register the "swipe".
		const { velocityX, deltaX, distance } = event;

		if (
			// Check if it was a fast flick,
			(Math.abs(velocityX) > 0.55 && distance > 10) ||
			// or if the pan distance was at least ~1/3 of the content area.
			Math.abs(deltaX) >= this.$el.clientWidth / 3
		) {
			if (velocityX > 0 || deltaX > 0) {
				this.goPrev();
			} else {
				this.goNext();
			}
			return;
		} else {
			Analytics.trackEvent('sticker-drawer', 'swipe-cancel');
		}

		this._updateSliderOffset();
	}

	private _updateSliderOffset(extraOffsetPx = 0) {
		const pagePercent = this.sheetPage - 1;
		const pagePx = (this.$refs.slider as HTMLElement).offsetWidth * -pagePercent;
		(this.$refs.slider as HTMLElement).style.transform = `translate3d( ${
			pagePx + extraOffsetPx
		}px, 0, 0 )`;
	}
	// VueTouch things - END

	async calculateStickersPerRow() {
		await nextTick();

		if (!this.$refs.content) {
			return;
		}

		this.stickersPerRow = Math.floor(
			(this.$refs.content.offsetWidth - this.drawerPadding * 2) / this.stickerSize
		);
	}

	@Watch('isLoading', { immediate: true })
	async onIsLoadingChange() {
		await nextTick();

		if (!this.drawerStore.isLoading.value) {
			setDrawerStoreHeight(this.drawerStore, this.$el.offsetHeight);
			this.calculateStickersPerRow();
		}
	}
}
</script>

<template>
	<div
		class="sticker-drawer"
		:class="{ '-touch': !Screen.isPointerMouse }"
		:style="styles.shell"
		@contextmenu.prevent
		@mousemove="onMouseMove"
		@mouseup="resetTouchedSticker()"
		@touchend="resetTouchedSticker()"
	>
		<div class="-margin" @click="onClickMargin()" />
		<div ref="content" class="-drawer-outer anim-fade-in-up" :style="styles.outer">
			<component
				:is="Screen.isPointerMouse ? 'app-scroll-scroller' : 'div'"
				:style="styles.dimensions"
			>
				<AppLoadingFade :is-loading="isLoading">
					<component
						:is="drawerNavigationComponent"
						class="-scroller"
						v-bind="drawerNavigationProps"
						@panstart="panStart"
						@pan="pan"
						@panend="panEnd"
					>
						<div ref="slider" class="-drawer-inner">
							<template v-if="hasStickers">
								<template v-for="(sheet, index) in stickerSheets" :key="index">
									<div class="-sheet" :style="styles.sheet">
										<AppStickerLayerDrawerItem
											v-for="item of sheet"
											:key="item.sticker.id"
											:style="styles.stickers"
											:sticker="item.sticker"
											:count="item.count"
											:size="drawerStickerSize"
											@mousedown="assignTouchedSticker(item)"
											@touchstart="assignTouchedSticker(item)"
										/>
									</div>
								</template>
							</template>
							<template v-else-if="hasLoaded">
								<div class="-no-stckers text-center">
									<p class="lead" style="padding: 0 16px">
										<AppTranslate>
											Oh no! Looks like you don't have any stickers.
										</AppTranslate>
									</p>
									<p>
										<AppTranslate>
											Use Game Jolt, like some posts, and you might get some.
										</AppTranslate>
									</p>
								</div>
							</template>
							<template v-else>
								<div />
							</template>
						</div>
					</component>
					<div v-if="!Screen.isPointerMouse">
						<AppEventItemMediaIndicator
							:count="stickerSheets.length"
							:current="sheetPage"
						/>
					</div>
				</AppLoadingFade>
			</component>
		</div>
		<div class="-margin" @click="onClickMargin()" />
	</div>
</template>

<style lang="stylus" scoped>
.-touch
	.-drawer-inner
		white-space: nowrap

	.-sheet
		display: inline-flex

.-loading
	margin: auto
	padding: 16px 0

.sticker-drawer
	position: fixed
	left: 0
	right: 0
	bottom: 0
	display: flex
	justify-content: center
	transition: transform 250ms $strong-ease-out

.-margin
	flex: auto

.-scroller
	height: 100%

.-drawer
	&-outer
		elevate-2()
		change-bg('bg')
		margin: 0 auto
		height: 100%
		overflow: hidden

		@media $media-xs
			width: 100%

		@media $media-sm-up
			border-top-left-radius: $border-radius-large
			border-top-right-radius: $border-radius-large

	&-inner
		transition: transform 300ms $strong-ease-out

.-sheet
	display: flex
	justify-content: center
	flex-wrap: wrap
</style>
