<script lang="ts" setup>
import { computed } from 'vue';

import { GameModel } from '~common/game/game.model';
import AppThemeSvg from '~common/theme/svg/AppThemeSvg.vue';

type Props = {
	game: GameModel;
	full?: boolean;
};

const { game, full } = defineProps<Props>();

const assetPaths = import.meta.glob<string>('./*.svg', {
	eager: true,
	query: '?url',
	import: 'default',
});

const imgTag = computed(() => {
	if (game) {
		if (game.tigrs_age === 1) {
			return 'all-ages';
		} else if (game.tigrs_age === 2) {
			return 'teen';
		} else if (game.tigrs_age === 3) {
			return 'mature';
		}
	}

	return '';
});

const imgUrl = computed(() => {
	return assetPaths[`./${imgTag.value}.svg`];
});

const imgTagUrl = computed(() => {
	return assetPaths[`./${imgTag.value}-tag.svg`];
});
</script>

<template>
	<div class="game-ogrs-tag theme-dark">
		<AppThemeSvg
			class="-tag"
			:src="imgTagUrl"
			width="80"
			height="16"
			:alt="imgTag"
			strict-colors
		/>
		<template v-if="full">
			<AppThemeSvg class="-face" :src="imgUrl" width="80" height="80" alt="" strict-colors />
			<img
				class="-logo"
				:src="assetPaths['./ogrs-logo.svg']"
				width="76"
				height="8"
				alt="OGRS"
			/>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.game-ogrs-tag
	display: inline-block
	margin-bottom: 0
	vertical-align: middle
	border: 4px solid $black
	background: $black

	::v-deep(img)
		display: block
		margin-left: auto
		margin-right: auto

.-face
.-logo
	margin-top: 4px
</style>
