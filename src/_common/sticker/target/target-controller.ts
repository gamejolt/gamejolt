import { Comment } from '../../comment/comment-model';
import { Fireside } from '../../fireside/fireside.model';
import { FiresidePost } from '../../fireside/post/post-model';
import { MediaItem } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';
import { StickerLayerController } from '../layer/layer-controller';
import { StickerPlacement } from '../placement/placement.model';
import { ValidStickerResource } from './target.vue';

export const StickerTargetParentControllerKey = Symbol('sticker-target-parent');

// TODO(vue3): probably needs to be done differently so we maintain reactivity
export class StickerTargetController {
	isInview = false;
	stickers: StickerPlacement[] = [];
	/** The stickers that have been added since the last time freshly rendered the target. */
	newStickers: StickerPlacement[] = [];
	hasLoadedStickers = false;

	/**
	 * This is the layer that this target lives within. It gets set when the
	 * AppStickerTarget registers the target to the layer.
	 */
	layer: null | StickerLayerController = null;

	parent: null | StickerTargetController = null;
	children: StickerTargetController[] = [];

	_shouldShow = false;

	get shouldShow() {
		// Stickers in a Live context will show, fade, then remove themselves
		// automatically. Always show Live stickers.
		if (this.isLive) {
			return true;
		}

		return Boolean(this._shouldShow || this.parent?.shouldShow || this.layer?.isShowingDrawer);
	}

	set shouldShow(shouldShow: boolean) {
		this._shouldShow = shouldShow;
	}

	/**
	 * Note, the AppStickerTarget component is what actually loads the stickers
	 * in based on this state changing.
	 */
	get shouldLoad() {
		return !this.isLive && this.shouldShow && this.isInview && !this.hasLoadedStickers;
	}

	constructor(
		public readonly model: FiresidePost | Comment | MediaItem | Fireside,
		parent?: StickerTargetController,
		/**
		 * Used to know if we should fade-out stickers after they've been
		 * placed, and if we should fetch previous placement data or not.
		 */
		public readonly isLive = false
	) {
		if (parent) {
			this.parent = parent;
			parent.children.push(this);
		}
	}
}

export function toggleStickersShouldShow(
	controller: StickerTargetController,
	/** Whether or not to force reload the stickers for this target. */
	forceLoad = false,
	shouldShow?: boolean
) {
	// The parent is the one that gets the state for should showing. All
	// children follow along within the getter.
	if (controller.parent) {
		toggleStickersShouldShow(controller.parent, forceLoad, shouldShow);
		return;
	}

	shouldShow = shouldShow ?? !controller.shouldShow;
	controller.shouldShow = shouldShow;

	if (forceLoad) {
		controller.hasLoadedStickers = false;
	}
}

export function getStickerModelResourceName(model: Model): ValidStickerResource {
	if (model instanceof Comment) {
		return 'Comment';
	} else if (model instanceof MediaItem) {
		return 'MediaItem';
	} else if (model instanceof FiresidePost) {
		return 'Fireside_Post';
	} else if (model instanceof Fireside) {
		return 'Fireside';
	}
	throw new Error('Stickers targets cannot attach to that type of model');
}

export function addStickerToTarget(controller: StickerTargetController, sticker: StickerPlacement) {
	controller.stickers.push(sticker);
	controller.newStickers.push(sticker);

	// Anytime we add new stickers to a non-Live target, show all the stickers again.
	if (!controller.isLive) {
		toggleStickersShouldShow(controller, false, true);
	}
}

/**
 * Use by stickers in a Live context to remove themselves after their animations finish.
 */
export function removeStickerFromTarget(
	controller: StickerTargetController,
	sticker: StickerPlacement
) {
	let index = controller.stickers.indexOf(sticker);
	if (index !== -1) {
		controller.stickers.splice(index, 1);
	}
	index = controller.newStickers.indexOf(sticker);
	if (index !== -1) {
		controller.newStickers.splice(index, 1);
	}
}
