import { Model } from '../../model/model.service';

export class GamePlaylistGame extends Model {
	game_playlist_id!: number;
	game_id!: number;
	added_on!: number;

	$save() {
		return this.$_save(
			'/web/library/games/add/playlist/' + this.game_playlist_id,
			'gamePlaylistGame',
			{
				data: {
					game_id: this.game_id,
					timestamp: Date.now(),
				},
			}
		);
	}

	$remove() {
		return this.$_remove(
			'/web/library/games/remove/playlist/' + this.game_id + '/' + this.game_playlist_id,
			{
				data: {
					timestamp: Date.now(),
				},
			}
		);
	}
}
