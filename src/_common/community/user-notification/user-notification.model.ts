import { Model, defineLegacyModel } from '../../model/model.service';
import { Community } from '../community.model';

export const enum CommunityUserNotificationType {
	POSTS_MOVE = 'posts/move',
	POSTS_EJECT = 'posts/eject',
	FIRESIDES_EJECT = 'firesides/eject',
}

export class CommunityUserNotification extends defineLegacyModel(
	class CommunityUserNotificationDefinition extends Model {
		declare community: Community;
		declare type: CommunityUserNotificationType;
		declare added_on: number;
		declare reason: string | null;
		declare extra_data: any;

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
) {}
