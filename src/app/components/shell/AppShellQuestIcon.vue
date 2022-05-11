<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import AppQuestFrame from '../../../_common/quest/AppQuestFrame.vue';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { useQuestStore } from '../../store/quest';

const { newQuestIds, questActivityIds } = useQuestStore();

const hasNew = computed(() => newQuestIds.value.size > 0);
const hasActivity = computed(() => questActivityIds.value.size > 0);
</script>

<template>
	<RouterLink
		v-app-tooltip.bottom="$gettext(`Quest Log`)"
		class="navbar-item"
		:to="{ name: 'quests' }"
	>
		<AppQuestFrame class="-frame" :active="hasNew">
			<AppJolticon icon="quest-log" />

			<template v-if="hasActivity" #above>
				<div class="-blip" />
			</template>
		</AppQuestFrame>
	</RouterLink>
</template>

<style lang="stylus" scoped>
.navbar-item
	padding: 10px 8px

.-frame
	width: 30px
	height: 30px

.-blip
	change-bg('highlight')
	position: absolute
	top: 0
	right: 0
	width: 8px
	height: 8px
	border-radius: 50%
	box-shadow: 0 0 4px black
</style>
