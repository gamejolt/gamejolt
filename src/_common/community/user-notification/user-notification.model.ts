import { CommunityModel } from '~common/community/community.model';
import { Model } from '~common/model/model.service';

export const CommunityUserNotificationTypePOSTS_MOVE = 'posts/move';
export const CommunityUserNotificationTypePOSTS_EJECT = 'posts/eject';

export type CommunityUserNotificationType =
	| typeof CommunityUserNotificationTypePOSTS_MOVE
	| typeof CommunityUserNotificationTypePOSTS_EJECT;

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
