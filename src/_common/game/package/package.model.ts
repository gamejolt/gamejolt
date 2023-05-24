import { Api } from '../../api/api.service';
import { Model } from '../../model/model.service';
import { Sellable } from '../../sellable/sellable.model';
import { GameBuild } from '../build/build.model';
import { Game } from '../game.model';
import { GameRelease } from '../release/release.model';

export class GamePackage extends Model {
	static readonly STATUS_HIDDEN = 'hidden';
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_REMOVED = 'removed';

	static readonly VISIBILITY_PRIVATE = 'private';
	static readonly VISIBILITY_PUBLIC = 'public';

	game_id!: number;
	sellable_id?: number;
	title!: string;
	description!: string;
	sort!: number;
	added_on!: number;
	published_on!: number;
	updated_on!: number;
	visibility!: string;
	partner_visibility!: boolean;
	status!: string;
	is_game_owner?: boolean;

	has_sales?: boolean;
	has_browser_builds?: boolean;
	is_in_paid_sellable?: boolean;

	/** The game for this package, matching the game id. Will only be rarely populated.  */
	game!: Game | null;

	// These fields get added only during GamePackagePayloadModel.
	_releases?: GameRelease[];
	_builds?: GameBuild[];
	_sellable?: Sellable;

	constructor(data: any = {}) {
		super(data);

		if (data.game) {
			this.game = new Game(data.game);
		} else {
			this.game = null;
		}
	}

	static $saveSort(gameId: number, packagesSort: any) {
		return Api.sendRequest(
			'/web/dash/developer/games/packages/save-sort/' + gameId,
			packagesSort
		);
	}

	shouldShowNamePrice() {
		return this._sellable && this._sellable.type === 'pwyw' && !this._sellable.is_owned;
	}

	$save() {
		if (!this.id) {
			return this.$_save(
				'/web/dash/developer/games/packages/save/' + this.game_id,
				'gamePackage'
			);
		} else {
			return this.$_save(
				'/web/dash/developer/games/packages/save/' + this.game_id + '/' + this.id,
				'gamePackage'
			);
		}
	}

	async $remove(game: Game) {
		const response = await this.$_remove(
			'/web/dash/developer/games/packages/remove/' + this.game_id + '/' + this.id
		);

		if (game && response.game) {
			game.assign(response.game);
		}

		return response;
	}
}

Model.create(GamePackage);
