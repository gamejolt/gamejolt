<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import AppCard from '../card/AppCard.vue';
import { formatNumber } from '../filters/number';
import AppJolticon from '../jolticon/AppJolticon.vue';
import AppProgressBar from '../progress/AppProgressBar.vue';

const props = defineProps({
	total: {
		type: Number,
		required: true,
	},
	achieved: {
		type: Number,
		required: true,
	},
	experience: {
		type: Number,
		required: true,
	},
	isLoggedInUser: {
		type: Boolean,
		default: true,
	},
});

const { achieved, total } = toRefs(props);

const completionRate = computed(() => Math.ceil((achieved.value / total.value) * 100));
</script>

<template>
	<AppCard class="trophy-completion">
		<template v-if="achieved > 0">
			<p>
				<span
					v-if="isLoggedInUser"
					v-translate="{
						achieved: formatNumber(achieved),
						total: formatNumber(total),
					}"
				>
					You've achieved
					<b>%{ achieved }</b>
					trophies out of a possible
					<b>%{ total }</b>
					.
				</span>
				<span
					v-else
					v-translate="{
						achieved: formatNumber(achieved),
						total: formatNumber(total),
					}"
				>
					They've achieved
					<b>%{ achieved }</b>
					trophies out of a possible
					<b>%{ total }</b>
					.
				</span>
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
