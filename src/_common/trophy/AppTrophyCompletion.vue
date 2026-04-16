<script lang="ts" setup>
import { computed } from 'vue';

import AppCard from '../card/AppCard.vue';
import { formatNumber } from '../filters/number';
import AppJolticon from '../jolticon/AppJolticon.vue';
import AppProgressBar from '../progress/AppProgressBar.vue';
import AppTranslate from '../translate/AppTranslate.vue';

type Props = {
	total: number;
	achieved: number;
	experience: number;
	isLoggedInUser?: boolean;
};
const { achieved, total, isLoggedInUser = true } = defineProps<Props>();

const completionRate = computed(() => Math.ceil((achieved / total) * 100));
</script>

<template>
	<AppCard class="trophy-completion">
		<template v-if="achieved > 0">
			<p>
				<AppTranslate
					v-if="isLoggedInUser"
					:translate-params="{
						achieved: formatNumber(achieved),
						total: formatNumber(total),
					}"
				>
					You've achieved %{ achieved } trophies out of a possible %{ total }.
				</AppTranslate>
				<AppTranslate
					v-else
					:translate-params="{
						achieved: formatNumber(achieved),
						total: formatNumber(total),
					}"
				>
					They've achieved %{ achieved } trophies out of a possible %{ total }.
				</AppTranslate>
			</p>
			<br />

			<AppProgressBar thin :percent="completionRate" />

			<div class="clearfix">
				<div class="pull-left">
					<div class="stat-big stat-big-smaller" style="margin-bottom: 0">
						<div class="stat-big-digit">{{ formatNumber(completionRate) }}%</div>
						<div class="stat-big-label">
							{{ $gettext('Completion') }}
						</div>
					</div>
				</div>
				<div class="pull-right">
					<div class="stat-big stat-big-smaller text-right" style="margin-bottom: 0">
						<div class="stat-big-digit">
							<AppJolticon icon="exp" class="text-muted" />
							{{ formatNumber(experience) }}
						</div>
						<div class="stat-big-label">
							{{ $gettext('EXP Gained') }}
						</div>
					</div>
				</div>
			</div>
		</template>
		<template v-else>
			{{ $gettext(`You haven't achieved any trophies for this game yet!`) }}
		</template>
	</AppCard>
</template>
