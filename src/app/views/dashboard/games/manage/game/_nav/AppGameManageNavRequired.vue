<script lang="ts" setup>
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';

type Props = {
	isComplete?: boolean;
};

const { isComplete } = defineProps<Props>();
</script>

<template>
	<span v-if="!isComplete" class="manage-game-nav-required">
		<span v-app-tooltip="$gettext(`Required Step`)">
			<AppJolticon notice icon="notice" />
		</span>
	</span>
</template>

<style lang="stylus" scoped>
.manage-game-nav-required
	@media $media-md
		position: absolute
		right: -25px

	@media $media-lg
		position: absolute
		right: 0
</style>
