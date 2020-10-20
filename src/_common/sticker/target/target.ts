import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Inject, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { Api } from '../../api/api.service';
import { getStickerModelResourceName } from '../../comment/comment-model';
import {
	assignDrawerStoreItem,
	DrawerStore,
	DrawerStoreKey,
	getPointerPosition,
	StickableTarget,
} from '../../drawer/drawer-store';
import { FiresidePost } from '../../fireside/post/post-model';
import { Growls } from '../../growls/growls.service';
import { MediaItem } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';
import { Ruler } from '../../ruler/ruler-service';
import {
	registerStickerTarget,
	StickerLayerController,
	StickerLayerKey,
} from '../layer/layer-controller';
import { StickerPlacement } from '../placement/placement.model';
import AppStickerReactions from '../reactions/reactions.vue';
import AppSticker from '../sticker.vue';

export type ValidStickerResource = 'Comment' | 'Fireside_Post' | 'Media_Item';

@Component({
	components: {
		AppSticker,
		AppStickerReactions,
	},
})
export default class AppStickerTarget extends Vue implements StickableTarget {
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;
	@Inject(StickerLayerKey) layer!: StickerLayerController;
	// JODO: make work
	@Prop(propRequired(Model)) model!: Model;
	@Prop(propOptional(Boolean, true)) showStickers!: boolean;
	@Prop(propOptional(Boolean, false)) noAnimateIn!: boolean;

	$el!: HTMLDivElement;

	@Emit('hide-all') emitHideAll() {}
	@Emit('stickers-visibility-change') emitStickersVisibilityChange(_visible: boolean) {}

	get stickers() {
		return this.model.stickers || [];
	}

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

	onPlaceDrawerSticker(event: MouseEvent | TouchEvent) {
		const { isDragging, sticker, stickerSize } = this.drawerStore;
		if (!isDragging || !sticker) {
			return;
		}

		const pointer = getPointerPosition(event);
		if (!pointer) {
			return;
		}

		const bounds = Ruler.offset(this.$el);

		/** JODO:
		 * The sticker placement is trending towards the middle of the page
		 * when it's actually mounted to the target. Need to figure out how to
		 * have it placed exactly where the ghost is, and if we want to modify
		 * the ghost position to make sure the sticker is always "in bounds" of the target.
		 */
		// Sticker placement is in percentage of container
		const stickerPlacement = new StickerPlacement({
			position_x: (pointer.x - bounds.left) / 0.9 / bounds.width,
			position_y: (pointer.y - bounds.top) / 0.9 / bounds.height,
			rotation: Math.random(),
			sticker: sticker,
		});

		assignDrawerStoreItem(this.drawerStore, stickerPlacement, this);
	}

	async onRedeemSticker() {
		const sticker = this.drawerStore.placedItem;
		if (!sticker) {
			return;
		}

		const resourceType = getStickerModelResourceName(this.model);
		const result = await Api.sendRequest(
			'/web/stickers/place',
			{
				stickerId: sticker.sticker.id,
				positionX: sticker.position_x,
				positionY: sticker.position_y,
				rotation: sticker.rotation,
				resource: resourceType,
				resourceId: this.model.id,
			},
			{ detach: true }
		);

		if (result.success) {
			const model = this._createNewModelResource(resourceType, result.resource);
			this.model.assign(model);
			this.emitStickersVisibilityChange(true);
		} else {
			Growls.error(this.$gettext(`Failed to place sticker.`));
		}
	}

	private _createNewModelResource(type: ValidStickerResource, resource: any) {
		if (type === 'Comment') {
			return new Comment(resource);
		}

		if (type === 'Fireside_Post') {
			return new FiresidePost(resource);
		}

		if (type === 'Media_Item') {
			return new MediaItem(resource);
		}

		return this.model;
	}

	getStickerAnimationDelay(placement: StickerPlacement) {
		return this.sorted.indexOf(placement) * 0.05 + 's';
	}

	onStickersRemoved() {
		this.emitHideAll();
	}
}
