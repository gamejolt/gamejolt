import { inject, InjectionKey } from 'vue';

import { CommunityCompetitionAwardModel } from '../../../../../../../../../_common/community/competition/award/award.model';

export type AssignAwardsRouteController = {
	onAssignAward: (awardId: CommunityCompetitionAwardModel['id']) => void;
	onUnassignAward: (awardId: CommunityCompetitionAwardModel['id']) => void;
};

export const AssignAwardsRouteControllerKey: InjectionKey<AssignAwardsRouteController> =
	Symbol('assign-awards-route');

export function useAssignAwardsRoute() {
	return inject(AssignAwardsRouteControllerKey)!;
}
