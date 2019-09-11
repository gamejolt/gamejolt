import { Model } from '../../model/model.service';
import { Game } from '../game.model';

export class GameVideo extends Model {
	static readonly TYPE_YOUTUBE = 'youtube';
	static readonly TYPE_VIMEO = 'vimeo';

	// Examples...
	// https://www.youtube.com/watch?v=DSvQAx5-PXU
	// http://www.youtube.com/watch?v=DSvQAx5-PXU
	// http://www.youtube.com/watch?v=DSvQAx5-PXU&bdfglkhdfg
	// www.youtube.com/watch?v=DSvQAx5-PXU
	// http://youtube.com/watch?v=DSvQAx5-PXU
	// youtube.com/watch?v=DSvQAx5-PXU
	// http://youtu.be/Y6lUVz1kdOk
	// http://youtu.be/Y6lUVz1kdOk?testing
	// http://vimeo.com/98hfg98dhfg
	static readonly REGEX = {
		VIDEO: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)([a-zA-Z0-9_\-]+)(\S*)$/i,
		YOUTUBE: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_\-]+)(\S*)$/i,
		VIMEO: /^(https?:\/\/)?(www\.)?(vimeo\.com\/)([a-zA-Z0-9_\-]+)(\S*)$/i,
	};

	media_type!: 'video';

	game_id!: number;
	type!: string;
	url!: string;
	title!: string;
	description!: string;
	posted_on!: number;
	status!: number;
	img_thumbnail!: string;
	img_thumbnail_med!: string;
	img_thumbnail_large!: string;

	getUrl(game: Game) {
		return game.getUrl() + `#video-${this.id}`;
	}

	$save() {
		if (!this.id) {
			return this.$_save('/web/dash/developer/games/media/save/video/' + this.game_id, 'gameVideo');
		} else {
			return this.$_save(
				'/web/dash/developer/games/media/save/video/' + this.game_id + '/' + this.id,
				'gameVideo'
			);
		}
	}

	$remove() {
		return this.$_remove(
			'/web/dash/developer/games/media/remove/video/' + this.game_id + '/' + this.id
		);
	}
}

Model.create(GameVideo);
