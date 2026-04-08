<script lang="ts" setup>
import { computed } from 'vue';
import { Perm } from '../../../../_common/collaborator/collaboratable';
import { GameModel } from '../../../../_common/game/game.model';
import { useGameDashRouteController } from '../../../views/dashboard/games/manage/manage.store';

type Props = {
	game?: GameModel;
	required?: string;
	either?: boolean;
	tag?: string;
	debug?: boolean;
};

const { game, required = '', either, tag = 'span' } = defineProps<Props>();

const gameRouteStore = useGameDashRouteController();

const targetGame = computed(() => {
	if (game) {
		return game;
	}

	if (gameRouteStore) {
		return gameRouteStore.game.value;
	}

	return undefined;
});

const hasPerms = computed(() => {
	const perms: Perm[] = (required as any).split(',');

	if (!targetGame.value) {
		throw new Error(`Target game doesn't exist for app-game-perms component.`);
	}

	return targetGame.value.hasPerms(
		perms.filter(perm => !!perm),
		either
	);
});
</script>

<template>
	<component :is="tag" v-if="hasPerms">
		<slot />
	</component>
</template>
