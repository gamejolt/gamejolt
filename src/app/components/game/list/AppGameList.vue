<script lang="ts" setup>
import { PropType } from 'vue';
import { GameModel } from '../../../../_common/game/game.model';
import AppGameListItem from './AppGameListItem.vue';

defineProps({
	games: {
		type: Array as PropType<GameModel[]>,
		required: true,
	},
	eventLabel: {
		type: String,
		default: undefined,
	},
});
</script>

<template>
	<div class="game-list">
		<AppGameListItem
			v-for="game of games"
			:key="game.id"
			:game="game"
			:event-label="eventLabel"
		/>
	</div>
</template>
