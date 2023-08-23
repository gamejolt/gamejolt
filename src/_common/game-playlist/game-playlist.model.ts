import { Api } from '../api/api.service';
import { Model } from '../model/model.service';
import { User } from '../user/user.model';
import { GamePlaylistGame } from './game/game.model';

export class GamePlaylist extends Model {
	user_id!: number;
	user!: User;
	name!: string;
	slug!: string;
	is_secret!: boolean;
	added_on!: number;
	updated_on!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
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
			playlists: GamePlaylist.populate(response.playlists) as GamePlaylist[],
			playlistsWithGame: (response.playlistsWithGame || []) as number[],
		};
	}

	async $addGame(gameId: number) {
		const playlistGame = new GamePlaylistGame();
		playlistGame.game_playlist_id = this.id;
		playlistGame.game_id = gameId;

		await playlistGame.$save();
		return playlistGame;
	}

	$removeGame(gameId: number) {
		const playlistGame = new GamePlaylistGame();
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
