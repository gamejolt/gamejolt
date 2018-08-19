import View from '!view!./widget.html?style=./widget.styl';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EventBus } from '../../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GameRating } from '../../../../lib/gj-lib-client/components/game/rating/rating.model';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';

@View
@Component({
	directives: {
		AppTooltip,
	},
})
export class AppRatingWidget extends Vue {
	@Prop(Game) game!: Game;
	@Prop(GameRating) rating?: GameRating;
	@Prop(Boolean) disabled?: boolean;

	isProcessing = false;
	gameRating = this.rating;

	get likeCountFormatted() {
		return number(this.game.like_count);
	}

	get hasLiked() {
		return this.rating && this.rating.rating === GameRating.RATING_LIKE;
	}

	get hasDisliked() {
		return this.rating && this.rating.rating === GameRating.RATING_DISLIKE;
	}

	@Watch('rating')
	newRating(rating: GameRating) {
		this.gameRating = rating;
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
		if (this.rating && this.rating.rating === rating) {
			await this.rating.$remove();

			this.gameRating = undefined;
		} else {
			const gameRating = new GameRating({
				game_id: this.game.id,
				rating: rating,
			});

			await gameRating.$save();

			this.gameRating = gameRating;
		}

		this.isProcessing = false;
		this.$emit('changed', this.gameRating);

		EventBus.emit('GameRating.changed', this.game.id);
	}
}
