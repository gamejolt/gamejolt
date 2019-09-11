import { Model } from '../../model/model.service';
import { GameBuild } from '../build/build.model';
import { GamePackage } from '../package/package.model';
import { Game } from '../game.model';

export class GameRelease extends Model {
	static readonly STATUS_HIDDEN = 'hidden';
	static readonly STATUS_PUBLISHED = 'published';
	static readonly STATUS_REMOVED = 'removed';

	game_id!: number;
	game_package_id!: number;
	version_number!: string;
	added_on!: number;
	published_on!: number;
	updated_on!: number;
	status!: string;
	sort!: number;
	scheduled_for_timezone!: string | null;
	scheduled_for!: number | null;

	/**
	 * Not active build count. All non-removed builds (even if not available yet).
	 */
	build_count!: number;

	// These fields get added only during GamePackagePayloadModel.
	_package?: GamePackage;
	_builds?: GameBuild[];

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

Model.create(GameRelease);
