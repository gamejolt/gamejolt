<script lang="ts" setup>
import AppGameListItem from '~app/components/game/list/AppGameListItem.vue';
import { GameModel } from '~common/game/game.model';

type Props = {
	games: GameModel[];
};
defineProps<Props>();
</script>

<template>
	<div class="game-list">
		<AppGameListItem v-for="game of games" :key="game.id" :game />
	</div>
</template>
