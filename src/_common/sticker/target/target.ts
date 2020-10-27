import Vue from 'vue';
import Component from 'vue-class-component';
import { Inject, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { Api } from '../../api/api.service';
import {
	assignDrawerStoreItem,
	DrawerStore,
	DrawerStoreKey,
	getPointerPosition,
	StickableTarget,
} from '../../drawer/drawer-store';
import { Growls } from '../../growls/growls.service';
import { Ruler } from '../../ruler/ruler-service';
import { ScrollInviewConfig } from '../../scroll/inview/config';
import { AppScrollInview } from '../../scroll/inview/inview';
import {
	registerStickerTarget,
	StickerLayerController,
	StickerLayerKey,
} from '../layer/layer-controller';
import { StickerPlacement } from '../placement/placement.model';
import AppStickerReactions from '../reactions/reactions.vue';
import AppSticker from '../sticker.vue';
import { getStickerModelResourceName, StickerTargetController } from './target-controller';

export type ValidStickerResource = 'Comment' | 'Fireside_Post' | 'MediaItem';

const InviewConfig = new ScrollInviewConfig();

@Component({
	components: {
		AppSticker,
		AppStickerReactions,
		AppScrollInview,
	},
})
export default class AppStickerTarget extends Vue implements StickableTarget {
	@Prop(propRequired(StickerTargetController)) controller!: StickerTargetController;

	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;
	@Inject(StickerLayerKey) layer!: StickerLayerController;

	$el!: HTMLDivElement;
	readonly InviewConfig = InviewConfig;

	// DODO: Scroll to the sticker target to show stickers.
	// if (visible) {
	// 	Scroll.to(this.$refs.stickerTarget.$el as HTMLElement, { preventDirections: ['down'] });
	// }

	get shouldIndicateStickable() {
		return this.drawerStore.isDrawerOpen;
	}

	// Sort so that the newer stickers go on top of the older ones.
	get stickers() {
		return [...this.controller.stickers].sort((a, b) => a.id - b.id);
	}

	created() {
		registerStickerTarget(this.layer, this);
	}

	beforeDestroy() {
		registerStickerTarget(this.layer, this);
	}

	@Watch('controller.shouldLoad')
	onShouldShowStickersChange() {
		this.loadStickers();
	}

	private async loadStickers() {
		this.controller.hasInitialized = true;

		const resourceName = getStickerModelResourceName(this.controller.model);
		const resourceId = this.controller.model.id;

		const { stickers } = await Api.sendRequest(
			`/web/stickers/fetch/${resourceName}/${resourceId}`
		);

		this.controller.stickers = StickerPlacement.populate(stickers);
	}

	onInview() {
		this.controller.isInview = true;
	}

	onOutview() {
		this.controller.isInview = false;
	}

	onPlaceDrawerSticker(event: MouseEvent | TouchEvent) {
		const { isDragging, sticker } = this.drawerStore;
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

		const { model } = this.controller;

		const resourceType = getStickerModelResourceName(model);
		const { success, resource } = await Api.sendRequest(
			'/web/stickers/place',
			{
				stickerId: sticker.sticker.id,
				positionX: sticker.position_x,
				positionY: sticker.position_y,
				rotation: sticker.rotation,
				resource: resourceType,
				resourceId: model.id,
			},
			{ detach: true }
		);

		if (success) {
			model.assign(resource);
		} else {
			Growls.error(this.$gettext(`Failed to place sticker.`));
		}
	}

	getStickerAnimationDelay(placement: StickerPlacement) {
		return this.stickers.indexOf(placement) * 0.05 + 's';
	}
}
