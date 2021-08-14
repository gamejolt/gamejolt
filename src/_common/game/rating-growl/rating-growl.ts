import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { onRatingWidgetChange } from '../../../app/components/rating/widget/widget';
import AppRatingWidget from '../../../app/components/rating/widget/widget.vue';
import { EventSubscription } from '../../system/event/event-topic';
import { Game } from '../game.model';

@Options({
	components: {
		AppRatingWidget,
	},
})
export default class AppGameRatingGrowl extends Vue {
	@Prop({ type: Game, required: true })
	game!: Game;

	private ratingChange$?: EventSubscription;

	@Emit('close')
	emitClose() {}

	mounted() {
		// Close the modal as soon as they rate the game. We set up on $on event
		// so that we get notified even if they rate the game from the game page
		// and not the modal.
		this.ratingChange$ = onRatingWidgetChange.subscribe(payload => {
			if (payload.gameId === this.game.id) {
				this.emitClose();
			}
		});
	}

	unmounted() {
		this.ratingChange$?.close();
	}
}
