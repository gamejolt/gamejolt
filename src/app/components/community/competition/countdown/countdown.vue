<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { CommunityCompetitionModel } from '../../../../../_common/community/competition/competition.model';

type BlockData = {
	digits: string[];
	text: string;
	hasSeparator: boolean;
};

@Options({})
export default class AppCommunityCompetitionCountdown extends Vue {
	@Prop({ type: Object, required: true }) competition!: CommunityCompetitionModel;

	updateTimer!: NodeJS.Timer | null;
	blocksData: BlockData[] = [];
	titleText = '';

	mounted() {
		this.updateTimer = setInterval(() => {
			this.updateDisplayData();
		}, 1000);
		this.updateDisplayData();
	}

	updateDisplayData() {
		let timestamp = 0;
		const period = this.competition.period;
		switch (period) {
			case 'pre-comp':
				this.titleText = this.$gettext(`Starts in`);
				timestamp = this.competition.starts_on;
				break;
			case 'running':
				this.titleText = this.$gettext(`Ends in`);
				timestamp = this.competition.ends_on;
				break;
			case 'voting':
				this.titleText = this.$gettext(`Voting ends in`);
				timestamp = this.competition.voting_ends_on;
				break;
			// No countdown is shown.
			case 'post-comp':
				this.titleText = this.$gettext(`The Jam has ended.`);
				this.blocksData = [];
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

		this.blocksData = [
			{
				digits: daysStr.split(''),
				text: this.$gettext(`day(s)`),
				hasSeparator: true,
			},
			{
				digits: hoursStr.split(''),
				text: this.$gettext(`hour(s)`),
				hasSeparator: true,
			},
			{
				digits: minsStr.split(''),
				text: this.$gettext(`minute(s)`),
				hasSeparator: true,
			},
			{
				digits: secondsStr.split(''),
				text: this.$gettext(`second(s)`),
				hasSeparator: false,
			},
		];
	}
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
