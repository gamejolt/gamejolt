import { canCommentOnModel, Comment } from '../../comment/comment-model';
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

		if (data.target_data === '') {
			this.target_data = {};
		}
	}
}

Model.create(StickerPlacement);

export function canPlaceStickerOnComment(model: Model, comment: Comment, parentComment?: Comment) {
	if (!comment.user.canComment) {
		return false;
	}
	if (parentComment && !parentComment.user.canComment) {
		return false;
	}

	return canCommentOnModel(model);
}

export function canPlaceStickerOnFiresidePost(post: FiresidePost) {
	if (!(post instanceof FiresidePost)) {
		throw Error('The provided model is not an instance of FiresidePost');
	}

	return !post.user.blocked_you && !post.user.is_blocked;
}

interface PlacementTargetData {
	host_user_id?: number;
}
