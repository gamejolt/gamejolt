import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { AppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { fuzzynumber } from '../../../../_common/filters/fuzzynumber';
import { Game } from '../../../../_common/game/game.model';
import { GameRating } from '../../../../_common/game/rating/rating.model';
import { Growls } from '../../../../_common/growls/growls.service';
import { LikersModal } from '../../../../_common/likers/modal.service';
import { EventBus } from '../../../../_common/system/event/event-bus.service';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';

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
	filters: {
		fuzzynumber,
	},
})
export default class AppRatingWidget extends Vue {
	@Prop(Game)
	game!: Game;

	@Prop(GameRating)
	userRating?: GameRating;

	@Prop(Boolean)
	hideCount?: boolean;

	@Prop(String)
	eventLabel?: string;

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
		Analytics.trackEvent('game-rating', 'like', this.eventLabel);
		this.updateVote(GameRating.RATING_LIKE);
	}

	dislike() {
		Analytics.trackEvent('game-rating', 'dislike', this.eventLabel);
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
