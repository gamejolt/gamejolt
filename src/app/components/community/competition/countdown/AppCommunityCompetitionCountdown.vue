<script lang="ts" setup>
import { PropType, onBeforeUnmount, onMounted, ref, toRefs } from 'vue';
import { CommunityCompetitionModel } from '../../../../../_common/community/competition/competition.model';
import { $gettext } from '../../../../../_common/translate/translate.service';

type BlockData = {
	digits: string[];
	text: string;
	hasSeparator: boolean;
};

const props = defineProps({
	competition: {
		type: Object as PropType<CommunityCompetitionModel>,
		required: true,
	},
});

const { competition } = toRefs(props);

let updateTimer: NodeJS.Timer | null = null;
const blocksData = ref<BlockData[]>([]);
const titleText = ref('');

onMounted(() => {
	updateTimer = setInterval(() => updateDisplayData(), 1000);
	updateDisplayData();
});

onBeforeUnmount(() => {
	if (updateTimer) {
		clearInterval(updateTimer);
		updateTimer = null;
	}
});

function updateDisplayData() {
	let timestamp = 0;
	const period = competition.value.period;
	switch (period) {
		case 'pre-comp':
			titleText.value = $gettext(`Starts in`);
			timestamp = competition.value.starts_on;
			break;
		case 'running':
			titleText.value = $gettext(`Ends in`);
			timestamp = competition.value.ends_on;
			break;
		case 'voting':
			titleText.value = $gettext(`Voting ends in`);
			timestamp = competition.value.voting_ends_on;
			break;
		// No countdown is shown.
		case 'post-comp':
			titleText.value = $gettext(`The Jam has ended.`);
			blocksData.value = [];
			return;
	}

	let diff = timestamp - Date.now();

	const daysInMil = 1000 * 60 * 60 * 24;
	const days = Math.floor(diff / daysInMil);
	const daysStr = days.toString(10).padStart(2, '0');
	diff -= days * daysInMil;

	const hoursInMil = 1000 * 60 * 60;
	const hours = Math.floor(diff / hoursInMil);
	const hoursStr = hours.toString(10).padStart(2, '0');
	diff -= hours * hoursInMil;

	const minsInMil = 1000 * 60;
	const mins = Math.floor(diff / minsInMil);
	const minsStr = mins.toString(10).padStart(2, '0');
	diff -= mins * minsInMil;

	const seconds = Math.floor(diff / 1000);
	const secondsStr = seconds.toString(10).padStart(2, '0');

	blocksData.value = [
		{
			digits: daysStr.split(''),
			text: $gettext(`day(s)`),
			hasSeparator: true,
		},
		{
			digits: hoursStr.split(''),
			text: $gettext(`hour(s)`),
			hasSeparator: true,
		},
		{
			digits: minsStr.split(''),
			text: $gettext(`minute(s)`),
			hasSeparator: true,
		},
		{
			digits: secondsStr.split(''),
			text: $gettext(`second(s)`),
			hasSeparator: false,
		},
	];
}
</script>

<template>
	<div class="-countdown">
		<div class="-title">
			<strong>{{ titleText }}</strong>
		</div>
		<div v-if="blocksData.length" class="-blocks">
			<div v-for="blockData of blocksData" :key="blockData.text" class="-block-container">
				<div class="-block">
					<div class="-block-digits">
						<div class="-block-digit">
							<template v-for="digit in blockData.digits">
								{{ digit }}
							</template>
						</div>
					</div>
					<div class="-block-text">
						<span class="text-muted">{{ blockData.text }}</span>
					</div>
				</div>
				<div v-if="blockData.hasSeparator" class="-block-separator">:</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-countdown
	display: flex
	flex-direction: column
	justify-content: center
	margin-bottom: $line-height-computed

	@media $media-sm-up
		flex-direction: row

.-title
	flex: none
	padding-top: 4px

	@media $media-sm-up
		margin-right: ($grid-gutter-width / 2)

.-blocks
	flex: none

.-block-container
	display: inline-flex
	align-items: center

.-block
	display: inline-flex
	flex-direction: column
	align-items: center

.-block-digit
	rounded-corners()
	elevate-1()
	display: inline-block
	font-weight: bold
	background-color: var(--theme-bg)
	padding: 4px 6px

.-block-text
	margin-top: 4px
	font-size: $font-size-tiny

.-block-separator
	display: inline-block
	margin-left: 8px
	margin-right: 8px
	margin-bottom: 20px
	font-size: $font-size-large
	font-weight: bold
</style>
