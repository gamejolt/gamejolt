import Vue from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import {
	assignDrawerStoreGhostCallback as assignDrawerStoreMoveCallback,
	commitDrawerStoreItemPlacement,
	DrawerStore,
	DrawerStoreKey,
	setDrawerStoreActiveItem,
} from '../../../drawer/drawer-store';

@Component({})
export default class AppStickerDrawerGhost extends Vue {
	@Inject(DrawerStoreKey) drawer!: DrawerStore;

	$el!: HTMLDivElement;

	get sticker() {
		return this.drawer.sticker!;
	}

	get shouldShowStickerControls() {
		return !!this.drawer.placedItem;
	}

	private get itemRotation() {
		if (this.drawer.placedItem) {
			return `rotate(${this.drawer.placedItem.rotation * 90 - 45}deg)`;
		} else {
			return null;
		}
	}

	get itemStyling() {
		return {
			transform: this.itemRotation,
			width: this.drawer.stickerSize + 'px',
			height: this.drawer.stickerSize + 'px',
		};
	}

	get controlsStyling() {
		const controlSize = 32;
		return {
			left: this.drawer.stickerSize / 2 - controlSize / 2 + 'px',
			width: controlSize + 'px',
			height: controlSize + 'px',
		};
	}

	get itemClasses() {
		const classes = [];

		if (this.drawer.isDragging) {
			classes.push('-dragging');
		}

		if (this.drawer.targetComponent) {
			classes.push('-uncommitted');
		}

		return classes;
	}

	mounted() {
		assignDrawerStoreMoveCallback(this.drawer, this.updateGhostPosition);
	}

	onConfirmPlacement() {
		commitDrawerStoreItemPlacement(this.drawer);
	}

	onStartDrag(event: MouseEvent | TouchEvent) {
		setDrawerStoreActiveItem(this.drawer, this.sticker, event, true);
	}

	updateGhostPosition(pos: { left: number; top: number }) {
		const { left, top } = pos;

		// JODO: Doesn't currently update the initial position properly. Works fine once the pointer is moved.

		this.$el.style.left = left + 'px';
		this.$el.style.top = top + 'px';
	}
}
