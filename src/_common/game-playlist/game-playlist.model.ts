import { Api } from '../api/api.service';
import { Model } from '../model/model.service';
import { UserModel } from '../user/user.model';
import {
	$removeGamePlaylistGame,
	$saveGamePlaylistGame,
	GamePlaylistGameModel,
} from './game/game.model';

export class GamePlaylistModel extends Model {
	user_id!: number;
	user!: UserModel;
	name!: string;
	slug!: string;
	is_secret!: boolean;
	added_on!: number;
	updated_on!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}
	}

	static async fetchPlaylists(options: { gameId?: number } = {}) {
		let queryString = '';
		if (options.gameId) {
			queryString += '?game_id=' + options.gameId;
		}

		const response: any = await Api.sendRequest('/web/library/playlists' + queryString, null, {
			ignoreLoadingBar: true,
		});

		return {
			playlists: GamePlaylistModel.populate(response.playlists) as GamePlaylistModel[],
			playlistsWithGame: (response.playlistsWithGame || []) as number[],
		};
	}
}

export async function $addGameToGamePlaylist(model: GamePlaylistModel, gameId: number) {
	const playlistGame = new GamePlaylistGameModel();
	playlistGame.game_playlist_id = model.id;
	playlistGame.game_id = gameId;

	await $saveGamePlaylistGame(playlistGame);
	return playlistGame;
}

export function $removeGameFromGamePlaylist(model: GamePlaylistModel, gameId: number) {
	const playlistGame = new GamePlaylistGameModel();
	playlistGame.game_playlist_id = model.id;
	playlistGame.game_id = gameId;

	return $removeGamePlaylistGame(playlistGame);
}

export function $saveGamePlaylist(model: GamePlaylistModel) {
	if (!model.id) {
		return model.$_save('/web/library/playlists/save', 'gamePlaylist');
	} else {
		return model.$_save('/web/library/playlists/save/' + model.id, 'gamePlaylist');
	}
}

export function $removeGamePlaylist(model: GamePlaylistModel) {
	return model.$_remove('/web/library/playlists/remove/' + model.id);
}
