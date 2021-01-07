import { Model } from '../../model/model.service';
import { Community } from '../community.model';

export const enum NotificationType {
	POSTS_MOVE = 'posts/move',
	POSTS_EJECT = 'posts/eject',
}

export class CommunityUserNotification extends Model {
	community!: Community;

	type!: NotificationType;
	added_on!: number;
	reason!: string | null;
	extra_data!: any;

	constructor(data: any = {}) {
		super(data);

		if (data.community) {
			this.community = new Community(data.community);
		}
	}

	$remove() {
		return this.$_remove(`/web/dash/communities/user-notifications/dismiss/${this.id}`, {
			ignoreLoadingBar: true,
		});
	}
}

Model.create(CommunityUserNotification);
