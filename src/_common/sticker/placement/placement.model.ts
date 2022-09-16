import { canCommentOnModel, Comment, CommentableModel } from '../../comment/comment-model';
import { FiresidePost } from '../../fireside/post/post-model';
import { Model } from '../../model/model.service';
import { Sticker } from '../sticker.model';

export class StickerPlacement extends Model {
	position_x!: number;
	position_y!: number;
	rotation!: number;

	sticker!: Sticker;

	target_data!: PlacementTargetData;
	is_charged!: boolean;

	constructor(data: any = {}) {
		super(data);

		if (data.sticker) {
			this.sticker = new Sticker(data.sticker);
		}

		if (data.target_data === '' || !data.target_data) {
			this.target_data = {};
		}
	}
}

Model.create(StickerPlacement);

export function canPlaceStickerOnComment(
	model: CommentableModel,
	comment: Comment,
	parentComment?: Comment
) {
	if (comment.user.hasAnyBlock) {
		return false;
	}

	if (model instanceof FiresidePost && !model.canPlaceSticker) {
		return false;
	}

	return canCommentOnModel(model, parentComment);
}

interface PlacementTargetData {
	host_user_id?: number;
}
