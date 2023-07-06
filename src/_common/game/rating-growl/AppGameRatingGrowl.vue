<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { useEventSubscription } from '../../system/event/event-topic';
import { Game } from '../game.model';
import AppGameRatingWidget, { onRatingWidgetChange } from '../rating/AppGameRatingWidget.vue';

const props = defineProps({
	game: {
		type: Object as PropType<Game>,
		required: true,
	},
});

const emit = defineEmits({
	close: () => true,
});

const { game } = toRefs(props);

// Close the modal as soon as they rate the game. We set up on $on event
// so that we get notified even if they rate the game from the game page
// and not the modal.
useEventSubscription(onRatingWidgetChange, payload => {
	if (payload.gameId === game.value.id) {
		emit('close');
	}
});
</script>

<template>
	<div>
		<h4>
			{{ $gettext(`What did you think?`) }}
		</h4>

		<p>{{ game.title }}</p>

		<div>
			<AppGameRatingWidget :game="game" />
		</div>

		<br />

		<p>
			<em>
				{{ $gettext(`Rating the games you play helps us show you better stuff.`) }}
			</em>
		</p>
	</div>
</template>
