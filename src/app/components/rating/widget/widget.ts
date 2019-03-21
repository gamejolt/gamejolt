import { AppAuthRequired } from 'game-jolt-frontend-lib/components/auth/auth-required-directive';
import { EventBus } from 'game-jolt-frontend-lib/components/event-bus/event-bus.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GameRating } from 'game-jolt-frontend-lib/components/game/rating/rating.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { LikersModal } from 'game-jolt-frontend-lib/components/likers/modal.service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

export const RatingWidgetOnChange = 'GameRating.changed';
export interface RatingWidgetOnChangePayload {
	gameId: number;
	userRating?: GameRating;
}

@Component({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppRatingWidget extends Vue {
	@Prop(Game)
	game!: Game;

	@Prop(GameRating)
	userRating?: GameRating;

	@Prop(Boolean)
	hideCount?: boolean;

	get likeCountFormatted() {
		return number(this.game.like_count);
	}

	get hasLiked() {
		return this.userRating && this.userRating.rating === GameRating.RATING_LIKE;
	}

	get hasDisliked() {
		return this.userRating && this.userRating.rating === GameRating.RATING_DISLIKE;
	}

	showLikers() {
		LikersModal.show({ count: this.game.like_count, resource: this.game });
	}

	like() {
		this.updateVote(GameRating.RATING_LIKE);
	}

	dislike() {
		this.updateVote(GameRating.RATING_DISLIKE);
	}

	private async updateVote(rating: number) {
		// when a rating with the same value already exists, remove it instead
		const oldUserRating = this.userRating;
		let operation = 0;

		try {
			if (oldUserRating && oldUserRating.rating === rating) {
				if (rating === GameRating.RATING_LIKE) {
					operation = -1;
				}

				this.game.like_count += operation;

				EventBus.emit(RatingWidgetOnChange, {
					gameId: this.game.id,
					userRating: undefined,
				} as RatingWidgetOnChangePayload);

				await oldUserRating.$remove();
			} else {
				const newUserRating = new GameRating({
					game_id: this.game.id,
					rating: rating,
				});

				// We only show likes, not dislikes.
				const oldRating = oldUserRating ? oldUserRating.rating : null;
				if (rating === GameRating.RATING_LIKE) {
					operation = 1;
				} else if (oldRating === GameRating.RATING_LIKE) {
					operation = -1;
				}

				this.game.like_count += operation;

				EventBus.emit(RatingWidgetOnChange, {
					gameId: this.game.id,
					userRating: newUserRating,
				} as RatingWidgetOnChangePayload);

				await newUserRating.$save();
			}
		} catch (e) {
			console.error(e);
			this.game.like_count -= operation;
			EventBus.emit(RatingWidgetOnChange, {
				gameId: this.game.id,
				userRating: oldUserRating,
			} as RatingWidgetOnChangePayload);
			Growls.error(`Can't do that now. Try again later?`);
		}
	}
}
