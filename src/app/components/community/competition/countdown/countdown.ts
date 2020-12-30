import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { CommunityCompetition } from '../../../../../_common/community/competition/competition.model';

type BlockData = {
	digit1: string;
	digit2: string;
	text: string;
	hasSeparator: boolean;
};

@Component({})
export default class AppCommunityCompetitionCountdown extends Vue {
	@Prop(propRequired(CommunityCompetition)) competition!: CommunityCompetition;

	updateTimer!: NodeJS.Timer | null;
	blocksData: BlockData[] = [];

	get titleText() {
		const period = this.competition.period;
		switch (period) {
			case 'pre-comp':
				return this.$gettext(`Starts in...`);
			case 'running':
				return this.$gettext(`Ends in...`);
			case 'voting':
				return this.$gettext(`Voting ends in...`);
			// No countdown is shown.
			case 'post-comp':
				return this.$gettext(`The Jam has ended.`);
		}
	}

	mounted() {
		this.updateTimer = setInterval(() => {
			this.updateBlocksData();
		}, 1000);
		this.updateBlocksData();
	}

	updateBlocksData() {
		let timestamp = 0;
		const period = this.competition.period;
		switch (period) {
			case 'pre-comp':
				timestamp = this.competition.starts_on;
				break;
			case 'running':
				timestamp = this.competition.ends_on;
				break;
			case 'voting':
				timestamp = this.competition.voting_ends_on;
				break;
			// No countdown is shown.
			case 'post-comp':
				return [];
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
				digit1: daysStr[0],
				digit2: daysStr[1],
				text: this.$gettext(`day(s)`),
				hasSeparator: true,
			},
			{
				digit1: hoursStr[0],
				digit2: hoursStr[1],
				text: this.$gettext(`hour(s)`),
				hasSeparator: true,
			},
			{
				digit1: minsStr[0],
				digit2: minsStr[1],
				text: this.$gettext(`minute(s)`),
				hasSeparator: true,
			},
			{
				digit1: secondsStr[0],
				digit2: secondsStr[1],
				text: this.$gettext(`second(s)`),
				hasSeparator: false,
			},
		];
	}
}
