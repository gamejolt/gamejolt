import { Inject, Options, Vue } from 'vue-property-decorator';
import { Analytics } from '../../analytics/analytics.service';
import {
	assignDrawerStoreGhostCallback as assignDrawerStoreMoveCallback,
	commitDrawerStoreItemPlacement,
	DrawerStore,
	DrawerStoreKey,
	setDrawerStoreActiveItem,
} from '../../drawer/drawer-store';

@Options({})
export default class AppStickerLayerGhost extends Vue {
	@Inject({ from: DrawerStoreKey })
	drawer!: DrawerStore;

	private isConfirmingPlacement = false;

	declare $el: HTMLDivElement;

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

		if (this.drawer.targetController) {
			classes.push('-uncommitted');
		}

		return classes;
	}

	mounted() {
		assignDrawerStoreMoveCallback(this.drawer, this.updateGhostPosition);
	}

	onConfirmPlacement() {
		// Only allow 1 placement request through at a time for each sticker ghost. This component will be v-if'd away after placement.
		if (this.isConfirmingPlacement) {
			return;
		}
		this.isConfirmingPlacement = true;
		Analytics.trackEvent('sticker-drawer', 'confirm-placement');
		commitDrawerStoreItemPlacement(this.drawer);
	}

	onStartDrag(event: MouseEvent | TouchEvent) {
		Analytics.trackEvent('sticker-drawer', 'start-drag');
		setDrawerStoreActiveItem(this.drawer, this.sticker, event, true);
	}

	updateGhostPosition(pos: { left: number; top: number }) {
		const { left, top } = pos;
		this.$el.style.transform = `translate3d(${left}px, ${top}px, 0)`;
	}
}
