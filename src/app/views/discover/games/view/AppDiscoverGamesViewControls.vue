<script lang="ts" setup>
import AppGameFollowWidget from '../../../../../_common/game/follow-widget/AppGameFollowWidget.vue';
import AppGamePlaylistAddToWidget from '../../../../components/game-playlist/add-to-widget/add-to-widget.vue';
import AppPageHeaderControls from '../../../../components/page-header/controls/controls.vue';
import { useGameRouteController } from './view.vue';

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
