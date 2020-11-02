import { Comment } from '../../comment/comment-model';
import { Model } from '../../model/model.service';
import { Sticker } from '../sticker.model';

export class StickerPlacement extends Model {
	position_x!: number;
	position_y!: number;
	rotation!: number;

	sticker!: Sticker;
	comment?: Comment;

	constructor(data: any = {}) {
		super(data);

		if (data.sticker) {
			this.sticker = new Sticker(data.sticker);
		}

		if (data.comment) {
			this.comment = new Comment(data.comment);
		}
	}
}

Model.create(StickerPlacement);
