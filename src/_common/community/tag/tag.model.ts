import { Api } from '../../../components/api/api.service';
import { Model } from '../../model/model.service';

export class CommunityTag extends Model {
	community_id!: number;
	tag!: string;
	added_on!: number;
	sort!: number;

	static $saveSort(communityId: number, tagIds: number[]) {
		return Api.sendRequest('/web/dash/communities/tags/save-sort/' + communityId, tagIds);
	}

	$save() {
		if (this.id) {
			throw new Error('Updating an existing tag is not supported');
		}

		return this.$_save('/web/dash/communities/tags/save/' + this.community_id, 'tag');
	}

	$remove() {
		if (!this.id) {
			return;
		}

		return this.$_remove(
			'/web/dash/communities/tags/remove/' + this.community_id + '/' + this.id,
			{
				detach: true,
			}
		);
	}
}

Model.create(CommunityTag);
