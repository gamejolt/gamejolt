import { Model } from '../../model/model.service';

export class GamePlaylistGameModel extends Model {
	game_playlist_id!: number;
	game_id!: number;
	added_on!: number;
}

export function $saveGamePlaylistGame(model: GamePlaylistGameModel) {
	return model.$_save(
		'/web/library/games/add/playlist/' + model.game_playlist_id,
		'gamePlaylistGame',
		{
			data: {
				game_id: model.game_id,
				timestamp: Date.now(),
			},
		}
	);
}

export function $removeGamePlaylistGame(model: GamePlaylistGameModel) {
	return model.$_remove(
		'/web/library/games/remove/playlist/' + model.game_id + '/' + model.game_playlist_id,
		{
			data: {
				timestamp: Date.now(),
			},
		}
	);
}
