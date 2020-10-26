import { Api } from '../../api/api.service';
import { Comment } from '../../comment/comment-model';
import { FiresidePost } from '../../fireside/post/post-model';
import { MediaItem } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';
import { StickerPlacement } from '../placement/placement.model';
import { ValidStickerResource } from './target';

export class StickerTargetController {
	isShowing = false;
	stickers: StickerPlacement[] = [];
	hasInitialized = false;

	constructor(public readonly model: FiresidePost | Comment | MediaItem) {}
}

export async function toggleStickersShowing(
	controller: StickerTargetController,
	shouldShow?: boolean
) {
	shouldShow = shouldShow ?? !controller.isShowing;
	controller.isShowing = shouldShow;

	if (shouldShow && !controller.hasInitialized) {
		controller.hasInitialized = true;

		const resourceName = getStickerModelResourceName(controller.model);
		const resourceId = controller.model.id;

		const { stickers } = await Api.sendRequest(
			`/web/stickers/fetch/${resourceName}/${resourceId}`
		);

		controller.stickers = StickerPlacement.populate(stickers);
	}
}

export function getStickerModelResourceName(model: Model): ValidStickerResource {
	if (model instanceof Comment) {
		return 'Comment';
	} else if (model instanceof MediaItem) {
		return 'Media_Item';
	} else if (model instanceof FiresidePost) {
		return 'Fireside_Post';
	}
	throw new Error('Stickers targets cannot attach to that type of model');
}
