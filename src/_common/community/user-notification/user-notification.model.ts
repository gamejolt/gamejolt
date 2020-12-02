import { Model } from '../../model/model.service';
import { Community } from '../community.model';

export class CommunityUserNotification extends Model {
	community!: Community;

	type!: string;
	added_on!: number;
	reason!: string | null;

	constructor(data: any = {}) {
		super(data);

		if (data.community) {
			this.community = new Community(data.community);
		}
	}
}

Model.create(CommunityUserNotification);
