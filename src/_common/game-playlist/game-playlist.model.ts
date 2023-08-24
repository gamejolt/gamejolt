import { Api } from '../api/api.service';
import { Model } from '../model/model.service';
import { UserModel } from '../user/user.model';
import { GamePlaylistGameModel } from './game/game.model';

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

	async $addGame(gameId: number) {
		const playlistGame = new GamePlaylistGameModel();
		playlistGame.game_playlist_id = this.id;
		playlistGame.game_id = gameId;

		await playlistGame.$save();
		return playlistGame;
	}

	$removeGame(gameId: number) {
		const playlistGame = new GamePlaylistGameModel();
		playlistGame.game_playlist_id = this.id;
		playlistGame.game_id = gameId;

		return playlistGame.$remove();
	}

	$save() {
		if (!this.id) {
			return this.$_save('/web/library/playlists/save', 'gamePlaylist');
		} else {
			return this.$_save('/web/library/playlists/save/' + this.id, 'gamePlaylist');
		}
	}

	$remove() {
		return this.$_remove('/web/library/playlists/remove/' + this.id);
	}
}
