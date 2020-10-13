import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { findRequiredVueParent, propOptional, propRequired } from '../../../../../utils/vue';
import {
	DrawerStore,
	DrawerStoreKey,
	setDrawerStoreActiveItem,
} from '../../../../../_common/drawer/drawer-store';
import AppScrollScrollerTS from '../../../../../_common/scroll/scroller/scroller';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import { Sticker } from '../../../../../_common/sticker/sticker.model';

@Component({})
export default class AppShellBottomDrawerItem extends Vue {
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;

	@Prop(propRequired(Sticker)) sticker!: Sticker;
	@Prop(propOptional(Number, 0)) count!: number;
	@Prop(propOptional(Number, 64)) size!: number;
	@Prop(propOptional(Boolean, false)) hideCount!: boolean;

	private touchTimer?: NodeJS.Timer;
	private topScroll = 0;
	private shouldUpdateScroll = false;

	$el!: HTMLDivElement;

	get itemStyling() {
		return {
			height: this.size + 'px',
			width: this.size + 'px',
		};
	}

	get canPeelSticker() {
		return this.drawerStore.isDrawerOpen && !this.drawerStore.sticker && this.count > 0;
	}

	onMouseDown(event: MouseEvent) {
		if (!this.canPeelSticker) {
			return;
		}

		setDrawerStoreActiveItem(this.drawerStore, this.sticker, event);
	}

	onTouchStart(event: TouchEvent) {
		this.shouldUpdateScroll = true;
		if (!this.canPeelSticker) {
			return;
		}

		this.touchTimer = setTimeout(() => {
			setDrawerStoreActiveItem(this.drawerStore, this.sticker, event);
			this.shouldUpdateScroll = false;
		}, 750);
	}

	onTouchMove(event: TouchEvent) {
		this.clearTouchTimer();

		if (!this.shouldUpdateScroll) {
			return;
		}

		const e = event.changedTouches[0];
		if (this.topScroll === 0) {
			this.topScroll = e.screenY;
		} else {
			const scroller = findRequiredVueParent<AppScrollScrollerTS>(this, AppScrollScroller)
				.$el;

			this.topScroll = (this.topScroll - e.screenY) * 2;

			scroller.scrollBy({
				top: this.topScroll,
			});

			this.topScroll = 0;
		}
	}

	onTouchEnd() {
		this.clearTouchTimer();
		this.shouldUpdateScroll = false;
		this.topScroll = 0;
	}

	clearTouchTimer() {
		if (this.touchTimer) {
			clearTimeout(this.touchTimer);
			this.touchTimer = undefined;
		}
	}
}
