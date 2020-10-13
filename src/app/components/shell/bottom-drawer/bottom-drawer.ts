import Vue from 'vue';
import { Component, Inject, Watch } from 'vue-property-decorator';
import {
	alterDrawerStoreItemCount,
	DrawerStore,
	DrawerStoreKey,
	StickableTarget,
} from '../../../../_common/drawer/drawer-store';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppStickerCard from '../../../../_common/sticker/card/card.vue';
import AppSticker from '../../../../_common/sticker/sticker.vue';
import AppShellBottomDrawerItem from './item/item.vue';

@Component({
	components: {
		// draggable,
		AppScrollScroller,
		AppStickerCard,
		AppSticker,
		AppShellBottomDrawerItem,
	},
})
export default class AppShellBottomDrawer extends Vue implements StickableTarget {
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;
	private placeholderHeight = 100;

	$el!: HTMLDivElement;

	get items() {
		return this.drawerStore.drawerItems;
	}

	get drawerStyling() {
		return {
			height: this.drawerHeight ? this.drawerHeight + 'px' : 'unset',
			bottom: this.drawerBottom + 'px',
		};
	}

	private get drawerHeight() {
		return this.placeholderHeight;
	}

	private get drawerBottom() {
		if (this.drawerStore.placedItem || !this.drawerStore.isDrawerOpen) {
			return -this.drawerHeight;
		}

		if (this.drawerStore.isDragging) {
			return -this.drawerHeight + 48;
		}

		return 0;
	}

	mounted() {
		this.placeholderHeight = window.innerHeight * 0.25;
	}

	onMouseUp() {
		if (!this.drawerStore.isDragging || !this.drawerStore.sticker) {
			return;
		}

		alterDrawerStoreItemCount(this.drawerStore, this.drawerStore.sticker, true);
	}

	onRedeemSticker() {
		// Not used here - only used in components that can redeem/claim stickers.
	}

	onClickCancel() {
		this.drawerStore.reset();
	}

	@Watch('drawerStore.drawerItems.length')
	async onDrawerItemsChange() {
		if (this.drawerStore.isDrawerOpen) {
			// Set the height to 0 (Vue template is changing to 'unset').
			this.placeholderHeight = 0;
			// Wait for the flex container to properly size based on content.
			await this.$nextTick();
			// Assign the container height to placeholderHeight,
			// preventing drawer resizes when items disappear through closing the drawer.
			this.placeholderHeight = this.$el.offsetHeight;
		}
	}
}
