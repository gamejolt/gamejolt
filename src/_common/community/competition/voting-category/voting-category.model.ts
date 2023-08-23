import { Model } from '../../../model/model.service';

export class CommunityCompetitionVotingCategory extends Model {
	declare community_competition_id: number;
	declare name: string;
	declare description: string | null;
	declare sort: number;

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
