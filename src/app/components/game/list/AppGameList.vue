<script lang="ts" setup>
import { GameModel } from '../../../../_common/game/game.model';
import AppGameListItem from './AppGameListItem.vue';

type Props = {
	games: GameModel[];
	eventLabel?: string;
};
defineProps<Props>();
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
