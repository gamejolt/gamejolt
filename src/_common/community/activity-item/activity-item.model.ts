import { FiresidePost } from '../../fireside/post/post-model';
import { Game } from '../../game/game.model';
import { Model } from '../../model/model.service';
import { UserBlock } from '../../user/block/block.model';
import { User } from '../../user/user.model';
import { CommunityChannel } from '../channel/channel.model';

export type TypeIcon = {
	icon: string;
	color: string;
};

export class CommunityActivityItem extends Model {
	public static TYPE_COMMUNITY_CREATED = 'community/created';

	public static TYPE_POST_FEATURE = 'post/feature';
	public static TYPE_POST_UNFEATURE = 'post/unfeature';
	public static TYPE_POST_MOVE = 'post/move';
	public static TYPE_POST_EJECT = 'post/eject';

	public static TYPE_MOD_INVITE = 'mod/invite';
	public static TYPE_MOD_ACCEPT = 'mod/accept';
	public static TYPE_MOD_REMOVE = 'mod/remove';

	public static TYPE_BLOCK_USER = 'block/user';

	public static TYPE_EDIT_DESCRIPTION = 'edit/description';
	public static TYPE_EDIT_THUMBNAIL = 'edit/thumbnail';
	public static TYPE_EDIT_HEADER = 'edit/header';
	public static TYPE_EDIT_DETAILS = 'edit/details';
	public static TYPE_EDIT_HEADER_REMOVE = 'edit/header/remove';

	public static TYPE_CHANNEL_ADD = 'channel/add';
	public static TYPE_CHANNEL_REMOVE = 'channel/remove';
	public static TYPE_CHANNEL_EDIT = 'channel/edit';

	public static TYPE_GAME_LINK = 'game/link';
	public static TYPE_GAME_UNLINK = 'game/unlink';

	type!: string;
	added_on!: number;
	extra_data!: string;

	user!: User;

	action_resource?: FiresidePost | User | CommunityChannel | UserBlock | Game;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.action_resource) {
			switch (this.type) {
				case CommunityActivityItem.TYPE_POST_FEATURE:
				case CommunityActivityItem.TYPE_POST_UNFEATURE:
				case CommunityActivityItem.TYPE_POST_MOVE:
				case CommunityActivityItem.TYPE_POST_EJECT:
					this.action_resource = new FiresidePost(data.action_resource);
					break;

				case CommunityActivityItem.TYPE_MOD_INVITE:
				case CommunityActivityItem.TYPE_MOD_ACCEPT:
				case CommunityActivityItem.TYPE_MOD_REMOVE:
					this.action_resource = new User(data.action_resource);
					break;

				case CommunityActivityItem.TYPE_BLOCK_USER:
					this.action_resource = new UserBlock(data.action_resource);
					break;

				case CommunityActivityItem.TYPE_CHANNEL_ADD:
				case CommunityActivityItem.TYPE_CHANNEL_EDIT:
					this.action_resource = new CommunityChannel(data.action_resource);
					break;

				case CommunityActivityItem.TYPE_GAME_LINK:
				case CommunityActivityItem.TYPE_GAME_UNLINK:
					this.action_resource = new Game(data.action_resource);
					break;
			}
		}
	}

	public getTypeIcon(): TypeIcon | undefined {
		switch (this.type) {
			case CommunityActivityItem.TYPE_COMMUNITY_CREATED:
				return { icon: 'heart-filled', color: 'notice' };

			case CommunityActivityItem.TYPE_POST_FEATURE:
				return { icon: 'fireside', color: '' };
			case CommunityActivityItem.TYPE_POST_UNFEATURE:
				return { icon: 'fireside', color: '' };
			case CommunityActivityItem.TYPE_POST_MOVE:
				return { icon: 'arrow-forward', color: '' };
			case CommunityActivityItem.TYPE_POST_EJECT:
				return { icon: 'remove', color: 'notice' };

			case CommunityActivityItem.TYPE_MOD_INVITE:
				return { icon: 'friend-add-1', color: '' };
			case CommunityActivityItem.TYPE_MOD_ACCEPT:
				return { icon: 'friends', color: 'theme' };
			case CommunityActivityItem.TYPE_MOD_REMOVE:
				return { icon: 'friend-remove-1', color: 'notice' };

			case CommunityActivityItem.TYPE_BLOCK_USER:
				return { icon: 'friend-remove-2', color: 'notice' };

			case CommunityActivityItem.TYPE_EDIT_DESCRIPTION:
			case CommunityActivityItem.TYPE_EDIT_THUMBNAIL:
			case CommunityActivityItem.TYPE_EDIT_HEADER:
			case CommunityActivityItem.TYPE_EDIT_DETAILS:
			case CommunityActivityItem.TYPE_EDIT_HEADER_REMOVE:
				return { icon: 'edit', color: '' };

			case CommunityActivityItem.TYPE_CHANNEL_ADD:
				return { icon: 'add', color: '' };
			case CommunityActivityItem.TYPE_CHANNEL_REMOVE:
				return { icon: 'remove', color: 'notice' };
			case CommunityActivityItem.TYPE_CHANNEL_EDIT:
				return { icon: 'edit', color: '' };

			case CommunityActivityItem.TYPE_GAME_LINK:
			case CommunityActivityItem.TYPE_GAME_UNLINK:
				return { icon: 'game', color: '' };
		}
	}
}

Model.create(CommunityActivityItem);
