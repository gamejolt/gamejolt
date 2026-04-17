<script lang="ts" setup>
import AppGamePlaylistAddToWidget from '~app/components/game-playlist/add-to-widget/add-to-widget.vue';
import AppPageHeaderControls from '~app/components/page-header/controls/AppPageHeaderControls.vue';
import { useGameRouteController } from '~app/views/discover/games/view/RouteDiscoverGamesView.vue';
import AppGameFollowWidget from '~common/game/follow-widget/AppGameFollowWidget.vue';

const { game } = useGameRouteController()!;
</script>

<template>
	<AppPageHeaderControls v-if="game">
		<AppGameFollowWidget :game="game" block show-user-follow location="gamePage" />

		<template #end>
			<AppGamePlaylistAddToWidget :game="game" event-label="game-header" />
		</template>
	</AppPageHeaderControls>
</template>
