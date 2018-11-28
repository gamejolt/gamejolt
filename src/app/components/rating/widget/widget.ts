import View from '!view!./widget.html?style=./widget.styl';
import { AppAuthRequired } from 'game-jolt-frontend-lib/components/auth/auth-required-directive.vue';
import { LikersModal } from 'game-jolt-frontend-lib/components/likers/modal.service';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { EventBus } from '../../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GameRating } from '../../../../lib/gj-lib-client/components/game/rating/rating.model';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';

export const RatingWidgetOnChange = 'GameRating.changed';
export interface RatingWidgetOnChangePayload {
	gameId: number;
	userRating?: GameRating;
}

@View
@Component({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export class AppRatingWidget extends Vue {
	@Prop(Game)
	game!: Game;

	@Prop(GameRating)
	userRating?: GameRating;

	@Prop(Boolean)
	hideCount?: boolean;

	isProcessing = false;

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
		if (this.isProcessing) {
			return;
		}

		this.isProcessing = true;

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
			this.game.like_count -= operation;
			EventBus.emit(RatingWidgetOnChange, {
				gameId: this.game.id,
				userRating: oldUserRating,
			} as RatingWidgetOnChangePayload);
			Growls.error(`Can't do that now. Try again later?`);
		}

		this.isProcessing = false;
	}
}
