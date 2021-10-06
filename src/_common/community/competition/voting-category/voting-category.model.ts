import { Api } from '../../../api/api.service';
import { Model } from '../../../model/model.service';

export class CommunityCompetitionVotingCategory extends Model {
	community_competition_id!: number;
	name!: string;
	description!: string | null;
	sort!: number;

	static $saveSort(competitionId: number, categoryIds: number[]) {
		return Api.sendRequest(
			`/web/dash/communities/competitions/voting-categories/save-sort/${competitionId}`,
			categoryIds
		);
	}

	$save() {
		if (this.id) {
			// Save existing category.
			return this.$_save(
				`/web/dash/communities/competitions/voting-categories/save/${this.id}`,
				'category'
			);
		}

		// Create new category.
		return this.$_save(`/web/dash/communities/competitions/voting-categories/save`, 'category');
	}

	$remove() {
		return this.$_remove(
			`/web/dash/communities/competitions/voting-categories/remove/${this.id}`
		);
	}
}

Model.create(CommunityCompetitionVotingCategory);
