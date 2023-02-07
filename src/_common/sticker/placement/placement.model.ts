import { Comment, CommentableModel } from '../../comment/comment-model';
import { Model } from '../../model/model.service';
import { Sticker } from '../sticker.model';

export class StickerPlacement extends Model {
	position_x!: number;
	position_y!: number;
	rotation!: number;

	sticker!: Sticker;

	target_data!: StickerPlacementTargetData;
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
	if (comment.user.hasAnyBlock === true || parentComment?.user.hasAnyBlock === true) {
		return false;
	}

	return model.canInteractWithComments;
}

export interface StickerPlacementTargetData {
	host_user_id?: number;
}
