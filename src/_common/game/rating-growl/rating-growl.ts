import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import {
	RatingWidgetOnChange,
	RatingWidgetOnChangePayload,
} from '../../../../../app/components/rating/widget/widget';
import AppRatingWidget from '../../../../../app/components/rating/widget/widget.vue';
import { EventBus, EventBusDeregister } from '../../event-bus/event-bus.service';
import { Game } from '../game.model';

@Component({
	components: {
		AppRatingWidget,
	},
})
export default class AppGameRatingGrowl extends Vue {
	@Prop(Game)
	game!: Game;

	private ratingWatchDeregister?: EventBusDeregister;

	mounted() {
		// Close the modal as soon as they rate the game. We set up on $on event so that we get
		// notified even if they rate the game from the game page and not the modal.
		this.ratingWatchDeregister = EventBus.on(
			RatingWidgetOnChange,
			(payload: RatingWidgetOnChangePayload) => {
				if (payload.gameId === this.game.id) {
					this.$emit('close');
				}
			}
		);
	}

	destroyed() {
		if (this.ratingWatchDeregister) {
			this.ratingWatchDeregister();
			this.ratingWatchDeregister = undefined;
		}
	}
}
