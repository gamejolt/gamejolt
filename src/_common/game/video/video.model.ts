import { LightboxMediaModel, LightboxMediaType } from '../../lightbox/lightbox-helpers';
import { Model } from '../../model/model.service';
import { GameModel } from '../game.model';

export const enum GameVideoType {
	Youtube = 'youtube',
	Vimeo = 'vimeo',
}

export class GameVideoModel extends Model implements LightboxMediaModel {
	media_type!: 'video';

	declare game_id: number;
	declare type: GameVideoType;
	declare url: string;
	declare title: string;
	declare description: string;
	declare posted_on: number;
	declare status: number;
	declare img_thumbnail: string;

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
}

export function $saveGameVideo(model: GameVideoModel) {
	if (!model.id) {
		return model.$_save(
			'/web/dash/developer/games/media/save/video/' + model.game_id,
			'gameVideo'
		);
	} else {
		return model.$_save(
			'/web/dash/developer/games/media/save/video/' + model.game_id + '/' + model.id,
			'gameVideo'
		);
	}
}

export function $removeGameVideo(model: GameVideoModel) {
	return model.$_remove(
		'/web/dash/developer/games/media/remove/video/' + model.game_id + '/' + model.id
	);
}
