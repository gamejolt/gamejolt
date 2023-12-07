import { MediaItemModel } from '../../media-item/media-item-model';
import { Model } from '../../model/model.service';

export type CompetitionPeriod = 'pre-comp' | 'running' | 'voting' | 'post-comp';

export type VotingUserRestriction = 'users' | 'participants';
export type VotingType = 'overall' | 'categories';

export const CompetitionPeriodPreComp = 0;
export const CompetitionPeriodRunning = 1;
export const CompetitionPeriodVoting = 2;
export const CompetitionPeriodPostComp = 3;

const PeriodNumerics: CompetitionPeriod[] = ['pre-comp', 'running', 'voting', 'post-comp'];

export class CommunityCompetitionModel extends Model {
	declare added_on: number;
	declare timezone: string;
	declare starts_on: number;
	declare ends_on: number;
	declare is_voting_enabled: boolean;
	declare voting_ends_on: number;
	declare has_community_voting: boolean;
	declare voting_type: VotingType;
	declare voting_user_restriction: VotingUserRestriction;
	declare has_awards: boolean;
	declare are_results_calculated: boolean;
	declare entry_count: number;
	declare header?: MediaItemModel;

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
			this.header = new MediaItemModel(data.header);
		}
	}
}

export function $saveCommunityCompetition(model: CommunityCompetitionModel) {
	return model.$_save(`/web/dash/communities/competitions/save/${model.id}`, 'competition');
}

export function $saveCommunityCompetitionVoting(model: CommunityCompetitionModel) {
	return model.$_save(
		`/web/dash/communities/competitions/voting/save/${model.id}`,
		'competition'
	);
}

export function $setVotingEnabledOnCommunityCompetition(model: CommunityCompetitionModel) {
	return model.$_save(
		`/web/dash/communities/competitions/voting/set-enabled/${model.id}`,
		'competition',
		{
			data: {
				is_voting_enabled: model.is_voting_enabled,
			},
		}
	);
}

export function $saveCommunityCompetitionHeader(model: CommunityCompetitionModel) {
	return model.$_save(
		`/web/dash/communities/competitions/header/save/${model.id}`,
		'competition',
		{
			file: model.file,
			allowComplexData: ['crop'],
		}
	);
}

export function $clearCommunityCompetitionHeader(model: CommunityCompetitionModel) {
	return model.$_save(
		`/web/dash/communities/competitions/header/clear/${model.id}`,
		'competition'
	);
}
