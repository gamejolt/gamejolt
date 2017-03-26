import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./rating-growl.html';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppRatingWidget } from '../../rating/widget/widget';
import { EventBus } from '../../../../lib/gj-lib-client/components/event-bus/event-bus.service';

@View
@Component({
	name: 'game-rating-growl',
	components: {
		AppRatingWidget,
	}
})
export class AppGameRatingGrowl extends Vue
{
	@Prop( Object ) game: Game;

	mounted()
	{
		// Close the modal as soon as they rate the game. We set up on $on event
		// so that we get notified even if they rate the game from the game page
		// and not the modal.
		EventBus.on( 'GameRating.changed', ( gameId: number ) =>
		{
			if ( gameId === this.game.id ) {
				this.$emit( 'close' );
			}
		} );
	}
}
