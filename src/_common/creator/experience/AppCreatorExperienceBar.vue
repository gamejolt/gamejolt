<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { formatNumber } from '../../filters/number';
import AppProgressBar from '../../progress/AppProgressBar.vue';
import { Screen } from '../../screen/screen-service';
import AppCreatorLevelBadge from './AppCreatorLevelBadge.vue';

const props = defineProps({
	level: {
		type: Number,
		required: true,
	},
	xp: {
		type: Number,
		required: true,
	},
	requiredXp: {
		type: Number,
		required: true,
	},
	isMaxLevel: {
		type: Boolean,
	},
});

const { level, xp, requiredXp, isMaxLevel } = toRefs(props);

const levelProgress = computed(() => {
	return Math.floor((xp.value / requiredXp.value) * 100);
});
const reachedCap = computed(() => xp.value === requiredXp.value && isMaxLevel.value);
const smLevels = computed(() => Screen.isMobile);
const nextLevelDisplay = computed(() => (isMaxLevel.value ? 'MAX' : (level.value + 1).toString()));
</script>

<template>
	<div :style="{ display: 'flex', alignItems: 'center' }">
		<AppCreatorLevelBadge :level="level.toString()" :sm="smLevels" class="_level-badge" />
		<div :style="{ marginLeft: '12px', marginRight: '12px', flexGrow: 1, textAlign: 'end' }">
			<span>
				<template v-if="reachedCap">
					<strong>{{ $gettext(`MAX LEVEL`) }}</strong>
				</template>
				<template v-else>
					<strong>{{ formatNumber(xp) }}</strong>
					/
					{{ formatNumber(requiredXp) }}
					XP
				</template>
			</span>
			<AppProgressBar :percent="levelProgress" hide-zero :thin="smLevels" glow />
		</div>
		<AppCreatorLevelBadge :level="nextLevelDisplay" :sm="smLevels" class="_level-badge" />
	</div>
</template>

<style lang="stylus" scoped>
._level-badge
	flex-shrink: 0
</style>
