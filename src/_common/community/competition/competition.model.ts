import { MediaItem } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';

export type CompetitionPeriod = 'pre-comp' | 'running' | 'voting' | 'post-comp';

export type VotingUserRestriction = 'users' | 'participants';
export type VotingType = 'overall' | 'categories';

export const CompetitionPeriodPreComp = 0;
export const CompetitionPeriodRunning = 1;
export const CompetitionPeriodVoting = 2;
export const CompetitionPeriodPostComp = 3;

const PeriodNumerics: CompetitionPeriod[] = ['pre-comp', 'running', 'voting', 'post-comp'];

export class CommunityCompetition extends Model {
	added_on!: number;
	timezone!: string;
	starts_on!: number;
	ends_on!: number;
	is_voting_enabled!: boolean;
	voting_ends_on!: number;
	has_community_voting!: boolean;
	voting_type!: VotingType;
	voting_user_restriction!: VotingUserRestriction;
	has_awards!: boolean;
	are_results_calculated!: boolean;

	entry_count!: number;

	header?: MediaItem;

	get period(): CompetitionPeriod {
		const now = Date.now();
		if (now < this.starts_on) {
			return 'pre-comp';
		}

		if (now < this.ends_on) {
			return 'running';
		}

		if (this.is_voting_enabled && now < this.voting_ends_on) {
			return 'voting';
		}

		return 'post-comp';
	}

	get periodNum(): number {
		return PeriodNumerics.indexOf(this.period);
	}

	get hasStarted() {
		return this.periodNum > CompetitionPeriodPreComp;
	}

	get hasEnded() {
		return this.periodNum > CompetitionPeriodRunning;
	}

	get isVotingSetUp() {
		return !!this.voting_ends_on;
	}

	constructor(data: any = {}) {
		super(data);

		if (data.header) {
			this.header = new MediaItem(data.header);
		}
	}

	$save() {
		return this.$_save(`/web/dash/communities/competitions/save/${this.id}`, 'competition');
	}

	$saveVoting() {
		return this.$_save(
			`/web/dash/communities/competitions/voting/save/${this.id}`,
			'competition'
		);
	}

	$saveVotingEnabled() {
		return this.$_save(
			`/web/dash/communities/competitions/voting/set-enabled/${this.id}`,
			'competition',
			{
				data: {
					is_voting_enabled: this.is_voting_enabled,
				},
			}
		);
	}

	$saveHeader() {
		return this.$_save(
			`/web/dash/communities/competitions/header/save/${this.id}`,
			'competition',
			{
				file: this.file,
				allowComplexData: ['crop'],
			}
		);
	}

	$clearHeader() {
		return this.$_save(
			`/web/dash/communities/competitions/header/clear/${this.id}`,
			'competition'
		);
	}
}

Model.create(CommunityCompetition);
