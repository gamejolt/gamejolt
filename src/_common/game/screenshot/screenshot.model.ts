import { Api } from '../../api/api.service';
import { LightboxMediaModel, LightboxMediaType } from '../../lightbox/lightbox-helpers';
import { MediaItemModel } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';
import { GameModel } from '../game.model';

export class GameScreenshotModel extends Model implements LightboxMediaModel {
	media_type!: 'image';

	game_id!: number;
	caption!: string;
	posted_on!: number;
	status!: number;
	media_item!: MediaItemModel;

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
		return 'image' as LightboxMediaType;
	}

	getMediaItem() {
		return this.media_item;
	}

	getUrl(game: GameModel) {
		return game.getUrl() + `#screenshot-${this.id}`;
	}
}

export async function $saveGameScreenshot(model: GameScreenshotModel) {
	if (!model.id) {
		// When adding, we add multiple, so we can't treat it like a normal model save.
		const response = await Api.sendRequest(
			'/web/dash/developer/games/media/save/image/' + model.game_id,
			model,
			{
				file: model.file,
				progress: event => {
					model._progress = event;
				},
			}
		);

		if (response.success) {
			return response;
		}

		throw response;
	} else {
		return model.$_save(
			'/web/dash/developer/games/media/save/image/' + model.game_id + '/' + model.id,
			'gameScreenshot'
		);
	}
}

export function $removeGameScreenshot(model: GameScreenshotModel) {
	return model.$_remove(
		'/web/dash/developer/games/media/remove/image/' + model.game_id + '/' + model.id
	);
}
