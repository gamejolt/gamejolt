import { Model } from '../../model/model.service';
import { Api } from '../../api/api.service';

export class JamAward extends Model {
	jam_id!: number;
	name!: string;
	description!: string;
	sort!: number;

	constructor(data: any = {}) {
		super(data);
	}

	static $saveSort(jamId: number, sortedIds: number[]) {
		return Api.sendRequest('/jams/manage/jams/awards/save-sort/' + jamId, sortedIds);
	}

	$save() {
		// Are we adding or saving?
		if (!this.id) {
			return this.$_save('/jams/manage/jams/awards/save/' + this.jam_id, 'jamAward');
		} else {
			return this.$_save(
				'/jams/manage/jams/awards/save/' + this.jam_id + '/' + this.id,
				'jamAward'
			);
		}
	}

	$remove() {
		return this.$_remove('/jams/manage/jams/awards/remove/' + this.id);
	}
}

Model.create(JamAward);
