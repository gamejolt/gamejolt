<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppRatingWidget, {
	onRatingWidgetChange,
} from '../../../app/components/rating/widget/widget.vue';
import { useEventSubscription } from '../../system/event/event-topic';
import { Game } from '../game.model';

@Options({
	components: {
		AppRatingWidget,
	},
})
export default class AppGameRatingGrowl extends Vue {
	@Prop({ type: Object, required: true })
	game!: Game;

	@Emit('close')
	emitClose() {}

	created() {
		// Close the modal as soon as they rate the game. We set up on $on event
		// so that we get notified even if they rate the game from the game page
		// and not the modal.
		useEventSubscription(onRatingWidgetChange, payload => {
			if (payload.gameId === this.game.id) {
				this.emitClose();
			}
		});
	}
}
</script>

<template>
	<div>
		<h4>
			<translate>What did you think?</translate>
		</h4>

		<p>{{ game.title }}</p>

		<div>
			<app-rating-widget :game="game" />
		</div>

		<br />

		<p>
			<em>
				<translate>Rating the games you play helps us show you better stuff.</translate>
			</em>
		</p>
	</div>
</template>
