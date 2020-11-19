import { Game } from '../../game/game.model';
import { HistoryTick } from '../../history-tick/history-tick-service';
import { Model } from '../../model/model.service';
import { Comment } from '../comment-model';

export class CommentVideo extends Model {
	video_id!: string;
	channel_id!: string;
	img_thumbnail!: string;
	title!: string;

	comment!: Comment;
	game!: Game;

	constructor(data: any = {}) {
		super(data);

		if (data.comment) {
			this.comment = new Comment(data.comment);
		}

		if (data.game) {
			this.game = new Game(data.game);
		}
	}
}

Model.create(CommentVideo);

export function $viewCommentVideo(video: CommentVideo) {
	return HistoryTick.sendBeacon('comment-video', video.id);
}
