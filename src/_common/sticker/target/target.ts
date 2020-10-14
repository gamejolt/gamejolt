import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Inject, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import {
	assignDrawerStoreItem,
	DrawerStore,
	DrawerStoreKey,
	StickableTarget,
} from '../../drawer/drawer-store';
import { Ruler } from '../../ruler/ruler-service';
import {
	registerStickerTarget,
	StickerLayerController,
	StickerLayerKey,
} from '../layer/layer-controller';
import { StickerPlacement } from '../placement/placement.model';
import AppSticker from '../sticker.vue';

@Component({
	components: {
		AppSticker,
	},
})
export default class AppStickerTarget extends Vue implements StickableTarget {
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;
	@Inject(StickerLayerKey) layer!: StickerLayerController;
	// JODO: does this make sense?
	@Prop(propOptional(Array, () => [])) stickers!: StickerPlacement[];
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

	created() {
		registerStickerTarget(this.layer, this);
	}

	beforeDestroy() {
		registerStickerTarget(this.layer, this);
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

	async onRedeemSticker() {
		const sticker = this.drawerStore.placedItem;

		if (!sticker) {
			return;
		}

		// JODO: Send Api request to add sticker to the model/resource
		console.log('placing sticker!');

		// const result = await Api.sendRequest(
		// 	'/web/stickers/place',
		// 	{
		// 		stickerId: sticker.id,
		// 		positionX: sticker.position_x,
		// 		positionY: sticker.position_y,
		// 		rotation: sticker.rotation,
		// 		resource: 'Fireside_Post',
		// 		resourceId: this.model.id,
		// 	},
		// 	{ detach: true }
		// );

		// if (result.success) {
		// 	const post = new FiresidePost(result.post);
		// 	Object.assign(this.post, post);
		// 	this.emitStickersVisibilityChange(true);
		// 	Analytics.trackEvent('stickers', 'place-sticker', 'fireside-post');
		// } else {
		// 	Growls.error(this.$gettext(`Failed to place sticker.`));
		// }
	}

	getStickerAnimationDelay(placement: StickerPlacement) {
		return this.sorted.indexOf(placement) * 0.05 + 's';
	}

	onStickersRemoved() {
		this.emitHideAll();
	}
}
