import Vue from 'vue';
import { Component, Inject, Watch } from 'vue-property-decorator';
import { DrawerStore, DrawerStoreKey, setDrawerStoreHeight } from '../../drawer/drawer-store';
import AppScrollScroller from '../../scroll/scroller/scroller.vue';
import AppStickerCard from '../card/card.vue';
import AppSticker from '../sticker.vue';
import AppShellBottomDrawerItem from './item/item.vue';

@Component({
	components: {
		AppScrollScroller,
		AppStickerCard,
		AppSticker,
		AppShellBottomDrawerItem,
	},
})
export default class AppStickerDrawer extends Vue {
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
				// Drawer item is being hovered over drawer - show full drawer.
				return 0;
			}

			// Drawer item is being dragged away from the drawer - show top-half of first sticker row.
			return -this.drawerHeight + 40;
		}

		// Fully show drawer.
		return 0;
	}

	mounted() {
		// JODO: I'm not sure I like how this looks. Thinking I should add circular placeholders for stickers
		// and only have the drawer be 1 row high until we get the proper placeholder height.
		this.placeholderHeight = window.innerHeight * 0.25;
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
			setDrawerStoreHeight(this.drawerStore, this.placeholderHeight);
		}
	}

	beforeDestroy() {
		// JODO: Not sure if needed, but recompiling has been leaving lingering stickers sometimes.
		this.drawerStore.reset();
	}
}
