import { Model } from '../../model/model.service';
import { GameBuildModel } from '../build/build.model';
import { GameModel } from '../game.model';
import { GamePackageModel } from '../package/package.model';

export const enum GameReleaseStatus {
	Hidden = 'hidden',
	Published = 'published',
	Removed = 'removed',
}

export class GameReleaseModel extends Model {
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
	declare _package?: GamePackageModel;
	declare _builds?: GameBuildModel[];

	get isScheduled() {
		return !!this.scheduled_for;
	}
}

// unused/ no refs
export function $saveGameRelease(model: GameReleaseModel) {
	if (!model.id) {
		return model.$_save(
			'/web/dash/developer/games/releases/save/' +
				model.game_id +
				'/' +
				model.game_package_id,
			'gameRelease'
		);
	} else {
		return model.$_save(
			'/web/dash/developer/games/releases/save/' +
				model.game_id +
				'/' +
				model.game_package_id +
				'/' +
				model.id,
			'gameRelease'
		);
	}
}

export async function $removeGameRelease(model: GameReleaseModel, game: GameModel) {
	const response = await model.$_remove(
		'/web/dash/developer/games/releases/remove/' +
			model.game_id +
			'/' +
			model.game_package_id +
			'/' +
			model.id
	);

	if (game && response.game) {
		game.assign(response.game);
	}

	return response;
}

// unused/ no refs
export async function $publish(model: GameReleaseModel, game: GameModel) {
	const response = await model.$_save(
		'/web/dash/developer/games/releases/publish/' +
			model.game_id +
			'/' +
			model.game_package_id +
			'/' +
			model.id,
		'gameRelease'
	);

	if (game && response.game) {
		game.assign(response.game);
	}

	return response;
}

export async function $unpublishGameRelease(model: GameReleaseModel, game: GameModel) {
	const response = await model.$_save(
		'/web/dash/developer/games/releases/unpublish/' +
			model.game_id +
			'/' +
			model.game_package_id +
			'/' +
			model.id,
		'gameRelease'
	);

	if (game && response.game) {
		game.assign(response.game);
	}

	return response;
}
