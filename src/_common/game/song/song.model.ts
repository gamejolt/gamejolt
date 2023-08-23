import { Api } from '../../api/api.service';
import { Model } from '../../model/model.service';

export class GameSong extends Model {
	game_id!: number;
	filename!: string;
	title!: string;
	posted_on!: number;
	sort!: number;
	url!: string;

	static getSoundtrackDownloadUrl(gameId: number) {
		return Api.sendRequest(
			'/web/discover/games/audio/get-soundtrack-download-url/' + gameId,
			undefined,
			{
				detach: true,
			}
		);
	}

	static $saveSort(gameId: number, sort: number[]) {
		return Api.sendRequest('/web/dash/developer/games/music/save-sort/' + gameId, sort);
	}

	$save() {
		if (!this.id) {
			return this.$_save('/web/dash/developer/games/music/save/' + this.game_id, 'gameSong', {
				file: this.file,
			});
		} else {
			// May or may not have an upload file on an edit.
			return this.$_save(
				'/web/dash/developer/games/music/save/' + this.game_id + '/' + this.id,
				'gameSong',
				{ file: this.file }
			);
		}
	}

	$remove() {
		return this.$_remove(
			'/web/dash/developer/games/music/remove/' + this.game_id + '/' + this.id
		);
	}
}
