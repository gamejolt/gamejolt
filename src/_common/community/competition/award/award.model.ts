import { Api } from '../../../api/api.service';
import { Model } from '../../../model/model.service';

export class CommunityCompetitionAwardModel extends Model {
	community_competition_id!: number;
	name!: string;
	description!: string | null;
	sort!: number;

	entry_count!: number | null;

	static $saveSort(competitionId: number, awardIds: number[]) {
		return Api.sendRequest(
			`/web/dash/communities/competitions/awards/save-sort/${competitionId}`,
			awardIds
		);
	}

	$save() {
		if (this.id) {
			// Save existing award.
			return this.$_save(
				`/web/dash/communities/competitions/awards/save/${this.id}`,
				'award'
			);
		}

		// Create new award.
		return this.$_save(`/web/dash/communities/competitions/awards/save`, 'award');
	}

	$remove() {
		return this.$_remove(`/web/dash/communities/competitions/awards/remove/${this.id}`);
	}
}
