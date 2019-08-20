import { Model } from '../../model/model.service';
import { Api } from '../../api/api.service';

export class JamVotingCategory extends Model {
	jam_id!: number;
	name!: string;
	description!: string;
	sort!: number;

	constructor(data: any = {}) {
		super(data);
	}

	static $saveSort(jamId: number, sortedIds: number[]) {
		return Api.sendRequest('/jams/manage/jams/voting/save-sorted-categories/' + jamId, sortedIds);
	}

	$save() {
		// Are we adding or saving?
		if (!this.id) {
			return this.$_save(
				'/jams/manage/jams/voting/add-category/' + this.jam_id,
				'jamVotingCategory'
			);
		} else {
			return this.$_save('/jams/manage/jams/voting/save-category/' + this.id, 'jamVotingCategory');
		}
	}

	$remove() {
		return this.$_remove('/jams/manage/jams/voting/remove-category/' + this.id);
	}
}

Model.create(JamVotingCategory);
