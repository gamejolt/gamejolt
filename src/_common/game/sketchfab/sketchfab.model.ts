import { Model } from '../../model/model.service';
import { Game } from '../game.model';

export class GameSketchfab extends Model {
	media_type!: 'sketchfab';
	game_id!: number;
	sketchfab_id!: string;
	added_on!: number;
	status!: string;
	img_thumbnail!: string;
	img_thumbnail_med!: string;
	img_thumbnail_large!: string;

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
