import { Comment } from '../../comment/comment-model';
import { Fireside } from '../../fireside/fireside.model';
import { FiresidePost } from '../../fireside/post/post-model';
import { MediaItem } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';
import { StickerLayerController } from '../layer/layer-controller';
import { StickerPlacement } from '../placement/placement.model';
import { ValidStickerResource } from './target';

export const StickerTargetParentControllerKey = Symbol('sticker-target-parent');

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

	private _shouldShow = false;

	get shouldShow() {
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
		return this.shouldShow && this.isInview && !this.hasLoadedStickers;
	}

	constructor(
		public readonly model: FiresidePost | Comment | MediaItem | Fireside,
		parent?: StickerTargetController
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

	// Anytime we add new stickers to the target, show all the stickers again.
	toggleStickersShouldShow(controller, false, true);
}
