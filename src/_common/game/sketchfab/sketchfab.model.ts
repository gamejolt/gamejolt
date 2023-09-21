import { LightboxMediaModel, LightboxMediaType } from '../../lightbox/lightbox-helpers';
import { MediaItemModel } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';
import { GameModel } from '../game.model';

export class GameSketchfabModel extends Model implements LightboxMediaModel {
	declare media_type: 'sketchfab';

	declare game_id: number;
	declare sketchfab_id: string;
	declare added_on: number;
	declare status: string;
	declare media_item: MediaItemModel;

	// Needed for lightbox and other components that are used together with GameVideo.
	get img_thumbnail() {
		return this.media_item.mediaserver_url;
	}

	set img_thumbnail(img: string) {
		this.media_item.mediaserver_url = img;
	}

	constructor(data: any = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItemModel(data.media_item);
		}
	}

	getModelId() {
		return this.id;
	}

	getMediaType() {
		return 'sketchfab' as LightboxMediaType;
	}

	getMediaItem() {
		return this.media_item;
	}

	getUrl(game: GameModel) {
		return game.getUrl() + '#sketchfab-' + this.id;
	}
}

export function $saveGameSketchfab(model: GameSketchfabModel) {
	if (!model.id) {
		return model.$_save(
			'/web/dash/developer/games/media/save/sketchfab/' + model.game_id,
			'gameSketchfab'
		);
	} else {
		return model.$_save(
			'/web/dash/developer/games/media/save/sketchfab/' + model.game_id + '/' + model.id,
			'gameSketchfab'
		);
	}
}

export function $removeGameSketchfab(model: GameSketchfabModel) {
	return model.$_remove(
		'/web/dash/developer/games/media/remove/sketchfab/' + model.game_id + '/' + model.id
	);
}
