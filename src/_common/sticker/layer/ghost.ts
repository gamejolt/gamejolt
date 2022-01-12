import { Options, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../utils/vue';
import { Analytics } from '../../analytics/analytics.service';
import {
	assignDrawerStoreGhostCallback as assignDrawerStoreMoveCallback,
	commitDrawerStoreItemPlacement,
	setDrawerStoreActiveItem,
	useDrawerStore,
} from '../../drawer/drawer-store';

@Options({})
export default class AppStickerLayerGhost extends Vue {
	drawer = shallowSetup(() => useDrawerStore());

	private isConfirmingPlacement = false;

	declare $el: HTMLDivElement;

	get sticker() {
		return this.drawer.sticker.value!;
	}

	get stickerSize() {
		return this.drawer.stickerSize.value;
	}

	get placedItem() {
		return this.drawer.placedItem.value;
	}

	get shouldShowStickerControls() {
		return !!this.placedItem;
	}

	private get itemRotation() {
		if (this.placedItem) {
			return `rotate(${this.placedItem.rotation * 90 - 45}deg)`;
		} else {
			return null;
		}
	}

	get itemStyling() {
		return {
			transform: this.itemRotation,
			width: this.stickerSize + 'px',
			height: this.stickerSize + 'px',
		};
	}

	get controlsStyling() {
		const controlSize = 32;
		return {
			left: this.stickerSize / 2 - controlSize / 2 + 'px',
			width: controlSize + 'px',
			height: controlSize + 'px',
		};
	}

	get itemClasses() {
		const classes = [];
		const { isDragging, targetController } = this.drawer;

		if (isDragging.value) {
			classes.push('-dragging');
		}

		if (targetController.value) {
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
