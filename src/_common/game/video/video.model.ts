import { LightboxMediaModel, LightboxMediaType } from '../../lightbox/lightbox-helpers';
import { Model } from '../../model/model.service';
import { GameModel } from '../game.model';

export class GameVideoModel extends Model implements LightboxMediaModel {
	static readonly TYPE_YOUTUBE = 'youtube';
	static readonly TYPE_VIMEO = 'vimeo';

	media_type!: 'video';

	game_id!: number;
	type!: string;
	url!: string;
	title!: string;
	description!: string;
	posted_on!: number;
	status!: number;
	img_thumbnail!: string;

	getModelId() {
		return this.id;
	}

	getMediaType() {
		return 'video' as LightboxMediaType;
	}

	getMediaItem() {
		// Videos don't have and don't need a media item for lightbox.
		return undefined;
	}

	getUrl(game: GameModel) {
		return game.getUrl() + `#video-${this.id}`;
	}

	$save() {
		if (!this.id) {
			return this.$_save(
				'/web/dash/developer/games/media/save/video/' + this.game_id,
				'gameVideo'
			);
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
