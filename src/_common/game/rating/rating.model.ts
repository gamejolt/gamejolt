import { Model } from '../../model/model.service';

export const enum GameRatingValue {
	Like = 1,
	Dislike = 0,
}

export class GameRatingModel extends Model {
	declare game_id: number;
	declare rating: GameRatingValue;
	declare posted_on: number;
	declare type: string;
}

export function $saveGameRating(model: GameRatingModel) {
	// This is an upsert.
	return model.$_save('/web/discover/games/ratings/save/' + model.game_id, 'gameRating', {
		detach: true,
		ignoreLoadingBar: true,
		data: {
			rating: model.rating,
			timestamp: Date.now(),
		},
	});
}

export function $removeGameRating(model: GameRatingModel) {
	// This is a clear.
	// Doesn't depend on the rating ID, only the game ID.
	return model.$_remove('/web/discover/games/ratings/clear/' + model.game_id, {
		detach: true,
		ignoreLoadingBar: true,
		data: {
			timestamp: Date.now(),
		},
	});
}
