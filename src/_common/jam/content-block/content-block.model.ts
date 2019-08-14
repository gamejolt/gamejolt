import { Model } from '../../model/model.service';
import { Api } from '../../api/api.service';
import { Jam } from '../jam.model';

export class JamContentBlock extends Model {
	jam_id!: number;
	jam_page_id!: number;
	type!: string;
	content!: string;
	added_on!: number;
	updated_on!: number;

	static readonly TYPE_HEADER = 'header';
	static readonly TYPE_PAGE = 'page';

	constructor(data: any = {}) {
		super(data);
	}

	static async getBlock(blockId: number) {
		const response = await Api.sendRequest('/jams/manage/jams/content/get-block/' + blockId);

		return new JamContentBlock(response.jamContentBlock);
	}

	getEditUrl(jam: Jam) {
		return jam.fullUrl + '#edit-content:' + this.id;
	}

	$save() {
		return this.$_save('/jams/manage/jams/content/save-block/' + this.id, 'jamContentBlock');
	}
}

Model.create(JamContentBlock);
