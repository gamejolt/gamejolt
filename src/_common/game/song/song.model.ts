import { Api } from '../../api/api.service';
import { Model } from '../../model/model.service';

export class GameSongModel extends Model {
	declare game_id: number;
	declare filename: string;
	declare title: string;
	declare posted_on: number;
	declare sort: number;
	declare url: string;

	static getSoundtrackDownloadUrl(gameId: number) {
		return Api.sendRequest(
			'/web/discover/games/audio/get-soundtrack-download-url/' + gameId,
			undefined,
			{
				detach: true,
			}
		);
	}
}

export function $saveGameSongSort(gameId: number, sort: number[]) {
	return Api.sendRequest('/web/dash/developer/games/music/save-sort/' + gameId, sort);
}

export function $saveGameSong(model: GameSongModel) {
	if (!model.id) {
		return model.$_save('/web/dash/developer/games/music/save/' + model.game_id, 'gameSong', {
			file: model.file,
		});
	} else {
		// May or may not have an upload file on an edit.
		return model.$_save(
			'/web/dash/developer/games/music/save/' + model.game_id + '/' + model.id,
			'gameSong',
			{ file: model.file }
		);
	}
}

export function $removeGameSong(model: GameSongModel) {
	return model.$_remove(
		'/web/dash/developer/games/music/remove/' + model.game_id + '/' + model.id
	);
}
