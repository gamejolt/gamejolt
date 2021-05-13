import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { CommunityCompetition } from '../../../../../_common/community/competition/competition.model';

type BlockData = {
	digits: string[];
	text: string;
	hasSeparator: boolean;
};

@Component({})
export default class AppCommunityCompetitionCountdown extends Vue {
	@Prop(propRequired(CommunityCompetition)) competition!: CommunityCompetition;

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
