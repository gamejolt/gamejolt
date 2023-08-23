import { Model } from '../../model/model.service';
import { GameBuild } from '../build/build.model';
import { Game } from '../game.model';
import { GamePackage } from '../package/package.model';

export const enum GameReleaseStatus {
	Hidden = 'hidden',
	Published = 'published',
	Removed = 'removed',
}

export class GameRelease extends Model {
	declare game_id: number;
	declare game_package_id: number;
	declare version_number: string;
	declare added_on: number;
	declare published_on: number;
	declare updated_on: number;
	declare status: string;
	declare sort: number;
	declare scheduled_for_timezone: string | null;
	declare scheduled_for: number | null;

	/**
	 * Not active build count. All non-removed builds (even if not available yet).
	 */
	declare build_count: number;

	// These fields get added only during GamePackagePayloadModel.
	declare _package?: GamePackage;
	declare _builds?: GameBuild[];

	get isScheduled() {
		return !!this.scheduled_for;
	}

	$save() {
		if (!this.id) {
			return this.$_save(
				'/web/dash/developer/games/releases/save/' +
					this.game_id +
					'/' +
					this.game_package_id,
				'gameRelease'
			);
		} else {
			return this.$_save(
				'/web/dash/developer/games/releases/save/' +
					this.game_id +
					'/' +
					this.game_package_id +
					'/' +
					this.id,
				'gameRelease'
			);
		}
	}

	async $publish(game: Game) {
		const response = await this.$_save(
			'/web/dash/developer/games/releases/publish/' +
				this.game_id +
				'/' +
				this.game_package_id +
				'/' +
				this.id,
			'gameRelease'
		);

		if (game && response.game) {
			game.assign(response.game);
		}

		return response;
	}

	async $unpublish(game: Game) {
		const response = await this.$_save(
			'/web/dash/developer/games/releases/unpublish/' +
				this.game_id +
				'/' +
				this.game_package_id +
				'/' +
				this.id,
			'gameRelease'
		);

		if (game && response.game) {
			game.assign(response.game);
		}

		return response;
	}

	async $remove(game: Game) {
		const response = await this.$_remove(
			'/web/dash/developer/games/releases/remove/' +
				this.game_id +
				'/' +
				this.game_package_id +
				'/' +
				this.id
		);

		if (game && response.game) {
			game.assign(response.game);
		}

		return response;
	}
}
