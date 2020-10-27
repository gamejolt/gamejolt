import { Comment } from '../../comment/comment-model';
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
		const shouldShow = Boolean(
			this._shouldShow || this.parent?.shouldShow || this.layer?.isShowingDrawer
		);
		return shouldShow && this.isInview;
	}

	set shouldShow(shouldShow: boolean) {
		this._shouldShow = shouldShow;
	}

	/**
	 * Note, the AppStickerTarget component is what actually loads the stickers
	 * in based on this state.
	 */
	get shouldLoad() {
		return this.shouldShow && !this.hasLoadedStickers;
	}

	constructor(
		public readonly model: FiresidePost | Comment | MediaItem,
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
	shouldShow?: boolean
) {
	if (controller.parent) {
		throw new Error(`Can't directly show stickers for a target with a parent.`);
	}

	shouldShow = shouldShow ?? !controller.shouldShow;
	controller.shouldShow = shouldShow;
}

export function getStickerModelResourceName(model: Model): ValidStickerResource {
	if (model instanceof Comment) {
		return 'Comment';
	} else if (model instanceof MediaItem) {
		return 'MediaItem';
	} else if (model instanceof FiresidePost) {
		return 'Fireside_Post';
	}
	throw new Error('Stickers targets cannot attach to that type of model');
}
