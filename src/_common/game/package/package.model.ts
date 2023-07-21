import { Api } from '../../api/api.service';
import { Model, defineLegacyModel } from '../../model/model.service';
import { Sellable } from '../../sellable/sellable.model';
import { GameBuild } from '../build/build.model';
import { Game } from '../game.model';
import { GameRelease } from '../release/release.model';

export const enum GamePackageStatus {
	Hidden = 'hidden',
	Active = 'active',
	Removed = 'removed',
}

export const enum GamePackageVisibility {
	Private = 'private',
	Public = 'public',
}

export class GamePackage extends defineLegacyModel(
	class GamePackageDefinition extends Model {
		declare game_id: number;
		declare sellable_id?: number;
		declare title: string;
		declare description: string;
		declare sort: number;
		declare added_on: number;
		declare published_on: number;
		declare updated_on: number;
		declare visibility: GamePackageVisibility;
		declare partner_visibility: boolean;
		declare status: GamePackageStatus;
		declare is_game_owner?: boolean;
		declare has_sales?: boolean;
		declare has_browser_builds?: boolean;
		declare is_in_paid_sellable?: boolean;

		/** The game for this package, matching the game id. Will only be rarely populated.  */
		declare game: Game | null;

		// These fields get added only during GamePackagePayloadModel.
		declare _releases?: GameRelease[];
		declare _builds?: GameBuild[];
		declare _sellable?: Sellable;

		constructor(data: any = {}) {
			super(data);

			if (data.game) {
				this.game = new Game(data.game);
			} else {
				this.game = null;
			}
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
) {}

export function $saveGamePackageSort(gameId: number, packagesSort: any) {
	return Api.sendRequest('/web/dash/developer/games/packages/save-sort/' + gameId, packagesSort);
}
