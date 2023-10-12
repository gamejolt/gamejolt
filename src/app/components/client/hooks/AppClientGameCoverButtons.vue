<script lang="ts" setup>
import { computed, PropType } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { GameBuildModel } from '../../../../_common/game/build/build.model';
import { GameModel } from '../../../../_common/game/game.model';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useClientLibraryStore } from '../../../store/client-library';
import AppClientGameButtons from '../game-buttons/game-buttons.vue';

const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
	downloadableBuilds: {
		type: Array as PropType<GameBuildModel[]>,
		required: true,
	},
	browserBuilds: {
		type: Array as PropType<GameBuildModel[]>,
		required: true,
	},
	installableBuilds: {
		type: Array as PropType<GameBuildModel[]>,
		required: true,
	},
});

const emit = defineEmits({
	play: () => true,
});

const { findPackageToRepresentGameStatus } = useClientLibraryStore();

const localPackage = computed(() => findPackageToRepresentGameStatus(props.game.id));
</script>

<template>
	<div class="client-game-cover-buttons">
		<!--
		For Client we hide this once they start installing a package or if they
		have something installed.
		-->
		<AppButton
			v-if="browserBuilds.length > 0 && !localPackage"
			primary
			icon="play"
			@click="emit('play')"
		>
			<AppTranslate>Quick Play</AppTranslate>
		</AppButton>

		<!--
		Only show if there is any downloadable builds for the game. The
		component will show a tooltip saying it can't be installed for their
		platform if there's not an installable build.
		-->
		<AppClientGameButtons
			v-if="downloadableBuilds.length > 0"
			label="game-cover"
			:game="game"
			:can-install="installableBuilds.length > 0"
			no-progress
		/>
	</div>
</template>
