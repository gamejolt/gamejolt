import { Model } from '../../model/model.service';
import { CommunityModel } from '../community.model';

export const enum CommunityUserNotificationType {
	POSTS_MOVE = 'posts/move',
	POSTS_EJECT = 'posts/eject',
}

export class CommunityUserNotificationModel extends Model {
	declare community: CommunityModel;
	declare type: CommunityUserNotificationType;
	declare added_on: number;
	declare reason: string | null;
	declare extra_data: any;

	constructor(data: any = {}) {
		super(data);

		if (data.community) {
			this.community = new CommunityModel(data.community);
		}
	}
}

export function $removeCommunityUserNotification(model: CommunityUserNotificationModel) {
	return model.$_remove(`/web/dash/communities/user-notifications/dismiss/${model.id}`, {
		ignoreLoadingBar: true,
	});
}
