import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { DrawerStore, setDrawerStoreActiveItem } from '../../../../../_common/drawer/drawer-store';
import { Sticker } from '../../../../../_common/sticker/sticker.model';

@Component({})
export default class ItemGhost extends Vue {
	@Prop(propRequired(DrawerStore)) drawerStore!: DrawerStore;
	@Prop(propRequired(Sticker)) sticker!: Sticker;
	@Prop(propOptional(Number, 64)) size!: number;

	$el!: HTMLDivElement;

	get shouldShowStickerControls() {
		return !!this.drawerStore.placedItem;
	}

	private get itemRotation() {
		if (this.drawerStore.placedItem) {
			return `rotate(${this.drawerStore.placedItem.rotation * 90 - 45}deg)`;
		} else {
			return null;
		}
	}

	get itemStyling() {
		return {
			transform: this.itemRotation,
			width: this.size + 'px',
			height: this.size + 'px',
		};
	}

	get controlsStyling() {
		const controlSize = 32;
		return {
			left: this.size / 2 - controlSize / 2 + 'px',
			width: controlSize + 'px',
			height: controlSize + 'px',
		};
	}

	get itemClasses() {
		const classes = [];

		if (this.drawerStore.isDragging) {
			classes.push('-dragging');
		} else {
			if (this.drawerStore.targetComponent) {
				classes.push('-uncommitted');
			} else {
				classes.push('-faded');
			}
		}

		return classes;
	}

	onConfirmPlacement() {
		this.drawerStore.commitPlacement();
	}

	onStartDrag(event: MouseEvent | TouchEvent) {
		setDrawerStoreActiveItem(this.drawerStore, this.sticker, event, true);
	}
}
