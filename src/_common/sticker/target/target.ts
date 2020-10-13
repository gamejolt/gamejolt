import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Inject, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import {
	assignDrawerStoreItem,
	DrawerStore,
	DrawerStoreKey,
	StickableTarget,
} from '../../drawer/drawer-store';
import { Ruler } from '../../ruler/ruler-service';
import { StickerPlacement } from '../placement/placement.model';
import AppSticker from '../sticker.vue';

@Component({
	components: {
		AppSticker,
	},
})
export default class AppStickerTarget extends Vue implements StickableTarget {
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;

	@Prop(propRequired(Array)) stickers!: StickerPlacement[];
	// JODO: make work
	// @Prop(propRequired(Model)) model!: Model;
	@Prop(propOptional(Boolean, false)) showStickers!: boolean;
	@Prop(propOptional(Boolean, false)) noAnimateIn!: boolean;

	$el!: HTMLDivElement;

	@Emit('hide-all') emitHideAll() {}

	get shouldIndicateStickable() {
		return this.drawerStore.isDrawerOpen;
	}

	// Sort so that the newer stickers go on top of the older ones.
	get sorted() {
		return [...this.stickers].sort((a, b) => a.id - b.id);
	}

	onMouseUp() {
		if (!this.drawerStore.isDragging) {
			return;
		}

		const { sticker, ghost } = this.drawerStore;

		if (!sticker || !ghost) {
			return;
		}

		const bounds = Ruler.offset(this.$el);

		// Sticker placement is in percentage of container
		const stickerPlacement = new StickerPlacement({
			position_x: (ghost.offsetLeft - bounds.left) / 0.9 / bounds.width,
			position_y:
				(ghost.offsetTop - bounds.top + ghost.offsetHeight / 2) / 0.9 / bounds.height,
			rotation: Math.random(),
			sticker,
		});

		assignDrawerStoreItem(this.drawerStore, stickerPlacement, this);
	}

	onRedeemSticker() {
		// JODO: Send Api request to add sticker to the model/resource
	}

	getStickerAnimationDelay(placement: StickerPlacement) {
		return this.sorted.indexOf(placement) * 0.05 + 's';
	}

	onStickersRemoved() {
		this.emitHideAll();
	}
}
