import { Model } from '../../model/model.service';
import { MediaItem } from '../../media-item/media-item-model';
import { Game } from '../game.model';
import { Api } from '../../api/api.service';

export class GameScreenshot extends Model {
	media_type!: 'image';

	game_id!: number;
	caption!: string;
	posted_on!: number;
	status!: number;
	media_item!: MediaItem;
	img_thumbnail!: string;
	img_thumbnail_med!: string;
	img_thumbnail_large!: string;

	constructor(data: any = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItem(data.media_item);
		}
	}

	getUrl(game: Game) {
		return game.getUrl() + `#screenshot-${this.id}`;
	}

	async $save() {
		if (!this.id) {
			// When adding, we add multiple, so we can't treat it like a normal model save.
			const response = await Api.sendRequest(
				'/web/dash/developer/games/media/save/image/' + this.game_id,
				this,
				{
					file: this.file,
					progress: event => {
						this._progress = event;
					},
				}
			);

			if (response.success) {
				return response;
			}

			throw response;
		} else {
			return this.$_save(
				'/web/dash/developer/games/media/save/image/' + this.game_id + '/' + this.id,
				'gameScreenshot'
			);
		}
	}

	$remove() {
		return this.$_remove(
			'/web/dash/developer/games/media/remove/image/' + this.game_id + '/' + this.id
		);
	}
}

Model.create(GameScreenshot);
