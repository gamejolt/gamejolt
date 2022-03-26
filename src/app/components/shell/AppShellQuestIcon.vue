<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import AppQuestFrame from '../../../_common/quest/AppQuestFrame.vue';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
</script>

<template>
	<RouterLink
		v-app-tooltip.bottom="$gettext(`Quest Log`)"
		class="navbar-item"
		:to="{ name: 'quests' }"
	>
		<AppQuestFrame class="-frame">
			<AppJolticon icon="quest-log" />
		</AppQuestFrame>
	</RouterLink>
</template>

<style lang="stylus" scoped>
.navbar-item
	padding: 10px 8px

.-frame
	width: 30px
	height: 30px
</style>
