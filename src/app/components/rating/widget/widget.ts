import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./widget.html?style=./widget.styl';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GameRating } from '../../../../lib/gj-lib-client/components/game/rating/rating.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { EventBus } from '../../../../lib/gj-lib-client/components/event-bus/event-bus.service';

@View
@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppTooltip,
		AppTrackEvent,
	},
})
export class AppRatingWidget extends Vue {
	@Prop(Object) game: Game;
	@Prop(Object) rating?: GameRating;
	@Prop(Number) totalLikes: Number;

	clearLabel = '';
	hovered = 0;
	isProcessing = false;
	gameRating = this.rating;

	get likeCount() {
		return this.totalLikes;
	}

	get hasLiked() {
		return this.rating && this.rating.rating > 0;
	}

	get hasDisliked() {
		return this.rating && this.rating.rating === 0;
	}

	@Watch('rating')
	newRating(rating: GameRating) {
		this.gameRating = rating;
	}

	async updateVote(rating: number) {
		if (this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		const gameRating = new GameRating({
			game_id: this.game.id,
			rating: rating,
		});

		await gameRating.$save();

		this.gameRating = gameRating;
		this.isProcessing = false;

		this.$emit('changed', gameRating);
		EventBus.emit('GameRating.changed', this.game.id);
	}

	like() {
		this.updateVote(GameRating.RATING_LIKE);
	}

	dislike() {
		this.updateVote(GameRating.RATING_DISLIKE);
	}
}
