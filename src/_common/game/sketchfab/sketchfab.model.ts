import { MediaItem } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';
import { Game } from '../game.model';

export class GameSketchfab extends Model {
	media_type!: 'sketchfab';

	game_id!: number;
	sketchfab_id!: string;
	added_on!: number;
	status!: string;
	media_item!: MediaItem;

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
			this.media_item = new MediaItem(data.media_item);
		}
	}

	getUrl(game: Game) {
		return game.getUrl() + '#sketchfab-' + this.id;
	}

	$save() {
		if (!this.id) {
			return this.$_save(
				'/web/dash/developer/games/media/save/sketchfab/' + this.game_id,
				'gameSketchfab'
			);
		} else {
			return this.$_save(
				'/web/dash/developer/games/media/save/sketchfab/' + this.game_id + '/' + this.id,
				'gameSketchfab'
			);
		}
	}

	$remove() {
		return this.$_remove(
			'/web/dash/developer/games/media/remove/sketchfab/' + this.game_id + '/' + this.id
		);
	}
}

Model.create(GameSketchfab);
