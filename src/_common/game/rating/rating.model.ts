import { Model, defineLegacyModel } from '../../model/model.service';

export const enum GameRatingValue {
	Like = 1,
	Dislike = 0,
}

export class GameRating extends defineLegacyModel(
	class GameRatingDefinition extends Model {
		declare game_id: number;
		declare rating: GameRatingValue;
		declare posted_on: number;
		declare type: string;

		$save() {
			// This is an upsert.
			return this.$_save('/web/discover/games/ratings/save/' + this.game_id, 'gameRating', {
				detach: true,
				ignoreLoadingBar: true,
				data: {
					rating: this.rating,
					timestamp: Date.now(),
				},
			});
		}

		$remove() {
			// This is a clear.
			// Doesn't depend on the rating ID, only the game ID.
			return this.$_remove('/web/discover/games/ratings/clear/' + this.game_id, {
				detach: true,
				ignoreLoadingBar: true,
				data: {
					timestamp: Date.now(),
				},
			});
		}
	}
) {}
