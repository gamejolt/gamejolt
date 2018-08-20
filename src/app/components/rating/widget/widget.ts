import View from '!view!./widget.html?style=./widget.styl';
import { AppAuthRequired } from 'game-jolt-frontend-lib/components/auth/auth-required-directive.vue';
import { LikersModal } from 'game-jolt-frontend-lib/components/likers/modal.service';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { EventBus } from '../../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GameRating } from '../../../../lib/gj-lib-client/components/game/rating/rating.model';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';

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

	@Emit('change')
	onRatingChange(_rating?: GameRating) {}

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
		if (this.userRating && this.userRating.rating === rating) {
			await this.userRating.$remove();
			this.onRatingChange(undefined);
		} else {
			const gameRating = new GameRating({
				game_id: this.game.id,
				rating: rating,
			});

			await gameRating.$save();
			this.onRatingChange(gameRating);
		}

		this.isProcessing = false;

		EventBus.emit('GameRating.changed', this.game.id);
	}
}
