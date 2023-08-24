import { FiresideModel } from '../../fireside/fireside.model';
import { FiresidePostModel } from '../../fireside/post/post-model';
import { GameModel } from '../../game/game.model';
import { Model } from '../../model/model.service';
import { UserBlockModel } from '../../user/block/block.model';
import { UserModel } from '../../user/user.model';
import { CommunityChannelModel } from '../channel/channel.model';
import { CommunityCompetitionModel } from '../competition/competition.model';
import { CommunityCompetitionEntryModel } from '../competition/entry/entry.model';

export type TypeIcon = {
	icon: string;
	color: string;
};

export class CommunityActivityItemModel extends Model {
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
	public static TYPE_CHANNEL_RENAME = 'channel/rename';

	public static TYPE_GAME_LINK = 'game/link';
	public static TYPE_GAME_UNLINK = 'game/unlink';

	public static TYPE_COMPETITION_EDIT_SETTINGS = 'competition/edit/settings';
	public static TYPE_COMPETITION_EDIT_VOTING = 'competition/edit/voting';
	public static TYPE_COMPETITION_VOTING_SET_ACTIVE = 'competition/voting/set-active';
	public static TYPE_COMPETITION_ENTRY_REMOVE = 'competition/entry/remove';
	public static TYPE_COMPETITION_ENTRY_UNREMOVE = 'competition/entry/unremove';
	public static TYPE_COMPETITION_ENTRY_GIVE_AWARD = 'competition/entry/give-award';

	public static TYPE_FIRESIDE_START = 'fireside/start';
	public static TYPE_FIRESIDE_START_DRAFT = 'fireside/start-draft';
	public static TYPE_FIRESIDE_PUBLISH = 'fireside/publish';
	public static TYPE_FIRESIDE_EXTINGUISH = 'fireside/extinguish';
	public static TYPE_FIRESIDE_FEATURE = 'fireside/feature';
	public static TYPE_FIRESIDE_UNFEATURE = 'fireside/unfeature';
	public static TYPE_FIRESIDE_EJECT = 'fireside/eject';

	type!: string;
	added_on!: number;
	extra_data!: string;

	user?: UserModel;

	action_resource?:
		| FiresidePostModel
		| UserModel
		| CommunityChannelModel
		| UserBlockModel
		| GameModel
		| CommunityCompetitionModel
		| CommunityCompetitionEntryModel
		| FiresideModel;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}

		if (data.action_resource) {
			switch (this.type) {
				case CommunityActivityItemModel.TYPE_POST_FEATURE:
				case CommunityActivityItemModel.TYPE_POST_UNFEATURE:
				case CommunityActivityItemModel.TYPE_POST_MOVE:
				case CommunityActivityItemModel.TYPE_POST_EJECT:
					this.action_resource = new FiresidePostModel(data.action_resource);
					break;

				case CommunityActivityItemModel.TYPE_MOD_INVITE:
				case CommunityActivityItemModel.TYPE_MOD_ACCEPT:
				case CommunityActivityItemModel.TYPE_MOD_REMOVE:
					this.action_resource = new UserModel(data.action_resource);
					break;

				case CommunityActivityItemModel.TYPE_BLOCK_USER:
					this.action_resource = new UserBlockModel(data.action_resource);
					break;

				case CommunityActivityItemModel.TYPE_CHANNEL_ADD:
				case CommunityActivityItemModel.TYPE_CHANNEL_EDIT:
				case CommunityActivityItemModel.TYPE_CHANNEL_RENAME:
					this.action_resource = new CommunityChannelModel(data.action_resource);
					break;

				case CommunityActivityItemModel.TYPE_GAME_LINK:
				case CommunityActivityItemModel.TYPE_GAME_UNLINK:
					this.action_resource = new GameModel(data.action_resource);
					break;

				case CommunityActivityItemModel.TYPE_COMPETITION_EDIT_SETTINGS:
				case CommunityActivityItemModel.TYPE_COMPETITION_EDIT_VOTING:
				case CommunityActivityItemModel.TYPE_COMPETITION_VOTING_SET_ACTIVE:
					this.action_resource = new CommunityCompetitionModel(data.action_resource);
					break;

				case CommunityActivityItemModel.TYPE_COMPETITION_ENTRY_REMOVE:
				case CommunityActivityItemModel.TYPE_COMPETITION_ENTRY_UNREMOVE:
				case CommunityActivityItemModel.TYPE_COMPETITION_ENTRY_GIVE_AWARD:
					this.action_resource = new CommunityCompetitionEntryModel(data.action_resource);
					break;

				case CommunityActivityItemModel.TYPE_FIRESIDE_START:
				case CommunityActivityItemModel.TYPE_FIRESIDE_START_DRAFT:
				case CommunityActivityItemModel.TYPE_FIRESIDE_PUBLISH:
				case CommunityActivityItemModel.TYPE_FIRESIDE_EXTINGUISH:
				case CommunityActivityItemModel.TYPE_FIRESIDE_FEATURE:
				case CommunityActivityItemModel.TYPE_FIRESIDE_UNFEATURE:
				case CommunityActivityItemModel.TYPE_FIRESIDE_EJECT:
					this.action_resource = new FiresideModel(data.action_resource);
					break;
			}
		}
	}

	public getTypeIcon(): TypeIcon | undefined {
		switch (this.type) {
			case CommunityActivityItemModel.TYPE_COMMUNITY_CREATED:
				return { icon: 'heart-filled', color: 'notice' };

			case CommunityActivityItemModel.TYPE_POST_FEATURE:
			case CommunityActivityItemModel.TYPE_FIRESIDE_FEATURE:
				return { icon: 'star', color: '' };
			case CommunityActivityItemModel.TYPE_POST_UNFEATURE:
			case CommunityActivityItemModel.TYPE_FIRESIDE_UNFEATURE:
				return { icon: 'star', color: '' };
			case CommunityActivityItemModel.TYPE_POST_MOVE:
				return { icon: 'arrow-forward', color: '' };
			case CommunityActivityItemModel.TYPE_POST_EJECT:
			case CommunityActivityItemModel.TYPE_FIRESIDE_EJECT:
				return { icon: 'eject', color: 'notice' };

			case CommunityActivityItemModel.TYPE_MOD_INVITE:
				return { icon: 'friend-add-1', color: '' };
			case CommunityActivityItemModel.TYPE_MOD_ACCEPT:
				return { icon: 'friends', color: 'theme' };
			case CommunityActivityItemModel.TYPE_MOD_REMOVE:
				return { icon: 'friend-remove-1', color: 'notice' };

			case CommunityActivityItemModel.TYPE_BLOCK_USER:
				return { icon: 'friend-remove-2', color: 'notice' };

			case CommunityActivityItemModel.TYPE_EDIT_DESCRIPTION:
			case CommunityActivityItemModel.TYPE_EDIT_THUMBNAIL:
			case CommunityActivityItemModel.TYPE_EDIT_HEADER:
			case CommunityActivityItemModel.TYPE_EDIT_DETAILS:
			case CommunityActivityItemModel.TYPE_EDIT_HEADER_REMOVE:
			case CommunityActivityItemModel.TYPE_COMPETITION_EDIT_SETTINGS:
			case CommunityActivityItemModel.TYPE_COMPETITION_EDIT_VOTING:
				return { icon: 'edit', color: '' };

			case CommunityActivityItemModel.TYPE_CHANNEL_ADD:
				return { icon: 'add', color: '' };
			case CommunityActivityItemModel.TYPE_CHANNEL_REMOVE:
				return { icon: 'remove', color: 'notice' };
			case CommunityActivityItemModel.TYPE_CHANNEL_EDIT:
			case CommunityActivityItemModel.TYPE_CHANNEL_RENAME:
				return { icon: 'edit', color: '' };

			case CommunityActivityItemModel.TYPE_GAME_LINK:
			case CommunityActivityItemModel.TYPE_GAME_UNLINK:
				return { icon: 'gamepad', color: '' };

			case CommunityActivityItemModel.TYPE_COMPETITION_VOTING_SET_ACTIVE:
				return { icon: 'pedestals-numbers', color: '' };

			case CommunityActivityItemModel.TYPE_COMPETITION_ENTRY_REMOVE:
				return { icon: 'bullet-list', color: 'notice' };
			case CommunityActivityItemModel.TYPE_COMPETITION_ENTRY_UNREMOVE:
				return { icon: 'bullet-list', color: '' };

			case CommunityActivityItemModel.TYPE_COMPETITION_ENTRY_GIVE_AWARD:
				return { icon: 'medal', color: '' };

			case CommunityActivityItemModel.TYPE_FIRESIDE_START:
			case CommunityActivityItemModel.TYPE_FIRESIDE_START_DRAFT:
			case CommunityActivityItemModel.TYPE_FIRESIDE_PUBLISH:
				return { icon: 'fireside', color: '' };
			case CommunityActivityItemModel.TYPE_FIRESIDE_EXTINGUISH:
				return { icon: 'remove', color: '' };
		}
	}
}
