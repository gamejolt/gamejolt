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
	@Prop(Object) game!: Game;
	@Prop(Object) rating?: GameRating;

	clearLabel = '';
	hovered = 0;
	isProcessing = false;
	gameRating = this.rating;

	@Watch('rating')
	newRating(rating: GameRating) {
		this.gameRating = rating;
	}

	getTooltip(index: number) {
		if (index === 1) {
			return this.$gettext('rating.one');
		} else if (index === 2) {
			return this.$gettext('rating.two');
		} else if (index === 3) {
			return this.$gettext('rating.three');
		} else if (index === 4) {
			return this.$gettext('rating.four');
		} else if (index === 5) {
			return this.$gettext('rating.five');
		}
		return undefined;
	}

	isHovered(i: number) {
		return this.hovered >= i;
	}

	isSelected(i: number) {
		// Don't how any selected when hovering.
		return this.hovered === 0 && this.gameRating && this.gameRating.rating >= i;
	}

	hover(index?: number) {
		if (typeof index === 'undefined') {
			this.hovered = 0;
		} else {
			this.hovered = index;
		}
	}

	async select(index: number) {
		if (this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		const gameRating = new GameRating({
			game_id: this.game.id,
			rating: index,
		});

		await gameRating.$save();

		this.gameRating = gameRating;
		this.isProcessing = false;

		this.$emit('changed', gameRating);
		EventBus.emit('GameRating.changed', this.game.id);
	}

	async clear() {
		if (this.isProcessing || !this.gameRating) {
			return;
		}

		this.isProcessing = true;

		await this.gameRating.$remove();

		this.gameRating = undefined;
		this.isProcessing = false;

		this.$emit('changed', undefined);
		EventBus.emit('GameRating.changed', this.game.id);
	}
}
