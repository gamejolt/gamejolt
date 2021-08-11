import Vue from 'vue';
import { Component, Inject, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppEventItemMediaIndicator from '../../../app/components/event-item/media-indicator/media-indicator.vue';
import { Store } from '../../../app/store/index';
import { StickerCount } from '../../../app/views/dashboard/stickers/stickers';
import { Analytics } from '../../analytics/analytics.service';
import {
	DrawerStore,
	DrawerStoreKey,
	setDrawerOpen,
	setDrawerStoreActiveItem,
	setDrawerStoreHeight,
} from '../../drawer/drawer-store';
import { EscapeStack, EscapeStackCallback } from '../../escape-stack/escape-stack.service';
import AppLoadingFade from '../../loading/fade/fade.vue';
import { Screen } from '../../screen/screen-service';
import AppScrollScroller from '../../scroll/scroller/scroller.vue';
import { EventSubscription } from '../../system/event/event-topic';
import AppStickerCard from '../card/card.vue';
import { Sticker } from '../sticker.model';
import AppSticker from '../sticker.vue';
import AppStickerLayerDrawerItem from './drawer-item.vue';

if (!GJ_IS_SSR) {
	const VueTouch = require('vue-touch');
	Vue.use(VueTouch);
}

@Component({
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
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;
	@State hasCbar!: Store['hasCbar'];

	sheetPage = 1;
	isSwiping = false;
	private stickersPerRow = 5;
	private isWaitingForFrame = false;
	private touchedSticker: Sticker | null = null;
	private resize$: EventSubscription | undefined;
	private escapeCallback?: EscapeStackCallback;

	private readonly drawerPadding = 8;
	private readonly stickerSpacing = 8;
	private readonly stickerSize = this.drawerStore.stickerSize + this.stickerSpacing;
	readonly Screen = Screen;

	declare $el: HTMLDivElement;

	declare $refs: {
		content: HTMLDivElement;
		slider: HTMLDivElement;
	};

	get drawerNavigationComponent() {
		if (Screen.isPointerMouse) {
			return 'div';
		} else {
			return 'v-touch';
		}
	}

	get drawerNavigationProps() {
		if (!Screen.isPointerMouse) {
			return {
				'pan-options': { threshold: 16 },
			};
		}
	}

	get stickerSheets() {
		return this.chunkStickers(this.drawerStore.drawerItems);
	}

	private chunkStickers(stickers: StickerCount[]) {
		const sheets = [];

		let current: StickerCount[] = [];
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
		return this.drawerStore.isLoading;
	}

	get items() {
		return this.drawerStore.drawerItems;
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

		return {
			shell: [
				{
					transform: `translateY(0)`,
					// Max-width is unset when Xs (so it can bleed and span the whole width), with margins of 64px on other breakpoints.
					maxWidth: Screen.isXs ? 'unset' : `calc(100% - 64px)`,
					// Max-height of 2 sticker rows
					maxHeight: Screen.isPointerMouse
						? `${this.drawerPadding * 2 + this.stickerSize * numRowsShowing}px`
						: null,
				},
				// Shift the drawer down when there's an item being dragged and the drawer container is not being hovered.
				this.drawerStore.sticker && !this.drawerStore.isHoveringDrawer
					? {
							transform: `translateY(${
								this.drawerStore.drawerHeight - this.drawerStore.stickerSize / 2
							}px)`,
					  }
					: null,
			],
			outer: {
				cursor: this.drawerStore.isDragging ? 'grabbing' : 'default',
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

	mounted() {
		this.calculateStickersPerRow();
		this.resize$ = Screen.resizeChanges.subscribe(() => this.calculateStickersPerRow());

		this.escapeCallback = () => setDrawerOpen(this.drawerStore, false);
		EscapeStack.register(this.escapeCallback);
	}

	beforeDestroy() {
		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}

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

	assignTouchedSticker(sticker: StickerCount) {
		if (!this.drawerStore.isDrawerOpen || this.drawerStore.sticker || sticker.count <= 0) {
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

	panStart(event: HammerInput) {
		const { deltaX, deltaY } = event;
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			this.isSwiping = true;
		} else if (this.touchedSticker) {
			setDrawerStoreActiveItem(
				this.drawerStore,
				this.touchedSticker,
				event.changedPointers[0]
			);
		} else {
			return false;
		}
	}

	pan(event: HammerInput) {
		if (this.drawerStore.isDragging) {
			this.isSwiping = false;
			return;
		}
		if (!this.isWaitingForFrame) {
			this.isWaitingForFrame = true;
			window.requestAnimationFrame(() => this._panTick(event));
		}
	}

	private _panTick(event: HammerInput) {
		this.isWaitingForFrame = false;

		// In case the animation frame was retrieved after we stopped dragging.
		if (!this.isSwiping) {
			return;
		}

		this._updateSliderOffset(event.deltaX);
	}

	panEnd(event: HammerInput) {
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
		await this.$nextTick();

		if (!this.$refs.content) {
			return;
		}

		this.stickersPerRow = Math.floor(
			(this.$refs.content.offsetWidth - this.drawerPadding * 2) / this.stickerSize
		);
	}

	@Watch('isLoading')
	async onIsLoadingChange() {
		await this.$nextTick();

		if (!this.drawerStore.isLoading) {
			setDrawerStoreHeight(this.drawerStore, this.$el.offsetHeight);
			this.calculateStickersPerRow();
		}
	}
}
