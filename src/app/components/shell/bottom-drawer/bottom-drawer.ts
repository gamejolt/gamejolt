import Vue from 'vue';
import { Component, Inject, Watch } from 'vue-property-decorator';
import {
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
		if (!this.drawerStore.isDrawerOpen) {
			// Drawer item is placed on a valid target - hide drawer.
			return -this.drawerHeight;
		}

		if (this.drawerStore.placedItem || this.drawerStore.isDragging) {
			if (this.drawerStore.isHoveringDrawer) {
				// Drawer item is being hovered over drawer - shift drawer up slightly higher.
				return -this.drawerHeight + 64;
			}

			// Drawer item is being dragged away from the drawer - show top-half of first sticker row.
			return -this.drawerHeight + 40;
		}

		// Fully show drawer.
		return 0;
	}

	mounted() {
		this.placeholderHeight = window.innerHeight * 0.25;
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

	beforeDestroy() {
		// JODO: Not sure if needed, but recompiling has been leaving lingering stickers sometimes.
		this.drawerStore.reset();
	}
}
