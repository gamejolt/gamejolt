import { Model } from '../../../model/model.service';

export class CommunityCompetitionVotingCategoryModel extends Model {
	declare community_competition_id: number;
	declare name: string;
	declare description: string | null;
	declare sort: number;
}

export function $saveCommunityCompetitionVotingCategory(
	model: CommunityCompetitionVotingCategoryModel
) {
	if (model.id) {
		// Save existing category.
		return model.$_save(
			`/web/dash/communities/competitions/voting-categories/save/${model.id}`,
			'category'
		);
	}

	// Create new category.
	return model.$_save(`/web/dash/communities/competitions/voting-categories/save`, 'category');
}

export function $removeCommunityCompetitionVotingCategory(
	model: CommunityCompetitionVotingCategoryModel
) {
	return model.$_remove(
		`/web/dash/communities/competitions/voting-categories/remove/${model.id}`
	);
}
