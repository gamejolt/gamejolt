import { CommunityChannelModel } from '~common/community/channel/channel.model';
import { CommunityCompetitionModel } from '~common/community/competition/competition.model';
import { CommunityCompetitionEntryModel } from '~common/community/competition/entry/entry.model';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { GameModel } from '~common/game/game.model';
import { Jolticon } from '~common/jolticon/AppJolticon.vue';
import { Model } from '~common/model/model.service';
import { UserBlockModel } from '~common/user/block/block.model';
import { UserModel } from '~common/user/user.model';

type TypeIcon = {
	icon: Jolticon;
	color: string;
};

export const CommunityActivityItemTypeCommunityCreated = 'community/created';
export const CommunityActivityItemTypePostFeature = 'post/feature';
export const CommunityActivityItemTypePostUnfeature = 'post/unfeature';
export const CommunityActivityItemTypePostMove = 'post/move';
export const CommunityActivityItemTypePostEject = 'post/eject';
export const CommunityActivityItemTypeModInvite = 'mod/invite';
export const CommunityActivityItemTypeModAccept = 'mod/accept';
export const CommunityActivityItemTypeModRemove = 'mod/remove';
export const CommunityActivityItemTypeBlockUser = 'block/user';
export const CommunityActivityItemTypeEditDescription = 'edit/description';
export const CommunityActivityItemTypeEditThumbnail = 'edit/thumbnail';
export const CommunityActivityItemTypeEditHeader = 'edit/header';
export const CommunityActivityItemTypeEditDetails = 'edit/details';
export const CommunityActivityItemTypeEditHeaderRemove = 'edit/header/remove';
export const CommunityActivityItemTypeChannelAdd = 'channel/add';
export const CommunityActivityItemTypeChannelRemove = 'channel/remove';
export const CommunityActivityItemTypeChannelEdit = 'channel/edit';
export const CommunityActivityItemTypeChannelRename = 'channel/rename';
export const CommunityActivityItemTypeGameLink = 'game/link';
export const CommunityActivityItemTypeGameUnlink = 'game/unlink';
export const CommunityActivityItemTypeCompetitionEditSettings = 'competition/edit/settings';
export const CommunityActivityItemTypeCompetitionEditVoting = 'competition/edit/voting';
export const CommunityActivityItemTypeCompetitionVotingSetActive = 'competition/voting/set-active';
export const CommunityActivityItemTypeCompetitionEntryRemove = 'competition/entry/remove';
export const CommunityActivityItemTypeCompetitionEntryUnremove = 'competition/entry/unremove';
export const CommunityActivityItemTypeCompetitionEntryGiveAward = 'competition/entry/give-award';

export type CommunityActivityItemType =
	| typeof CommunityActivityItemTypeCommunityCreated
	| typeof CommunityActivityItemTypePostFeature
	| typeof CommunityActivityItemTypePostUnfeature
	| typeof CommunityActivityItemTypePostMove
	| typeof CommunityActivityItemTypePostEject
	| typeof CommunityActivityItemTypeModInvite
	| typeof CommunityActivityItemTypeModAccept
	| typeof CommunityActivityItemTypeModRemove
	| typeof CommunityActivityItemTypeBlockUser
	| typeof CommunityActivityItemTypeEditDescription
	| typeof CommunityActivityItemTypeEditThumbnail
	| typeof CommunityActivityItemTypeEditHeader
	| typeof CommunityActivityItemTypeEditDetails
	| typeof CommunityActivityItemTypeEditHeaderRemove
	| typeof CommunityActivityItemTypeChannelAdd
	| typeof CommunityActivityItemTypeChannelRemove
	| typeof CommunityActivityItemTypeChannelEdit
	| typeof CommunityActivityItemTypeChannelRename
	| typeof CommunityActivityItemTypeGameLink
	| typeof CommunityActivityItemTypeGameUnlink
	| typeof CommunityActivityItemTypeCompetitionEditSettings
	| typeof CommunityActivityItemTypeCompetitionEditVoting
	| typeof CommunityActivityItemTypeCompetitionVotingSetActive
	| typeof CommunityActivityItemTypeCompetitionEntryRemove
	| typeof CommunityActivityItemTypeCompetitionEntryUnremove
	| typeof CommunityActivityItemTypeCompetitionEntryGiveAward;

export class CommunityActivityItemModel extends Model {
	declare type: CommunityActivityItemType;
	declare added_on: number;
	declare extra_data: string;

	declare user?: UserModel;

	declare action_resource?:
		| FiresidePostModel
		| UserModel
		| CommunityChannelModel
		| UserBlockModel
		| GameModel
		| CommunityCompetitionModel
		| CommunityCompetitionEntryModel;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}

		if (data.action_resource) {
			switch (this.type) {
				case CommunityActivityItemTypePostFeature:
				case CommunityActivityItemTypePostUnfeature:
				case CommunityActivityItemTypePostMove:
				case CommunityActivityItemTypePostEject:
					this.action_resource = new FiresidePostModel(data.action_resource);
					break;

				case CommunityActivityItemTypeModInvite:
				case CommunityActivityItemTypeModAccept:
				case CommunityActivityItemTypeModRemove:
					this.action_resource = new UserModel(data.action_resource);
					break;

				case CommunityActivityItemTypeBlockUser:
					this.action_resource = new UserBlockModel(data.action_resource);
					break;

				case CommunityActivityItemTypeChannelAdd:
				case CommunityActivityItemTypeChannelEdit:
				case CommunityActivityItemTypeChannelRename:
					this.action_resource = new CommunityChannelModel(data.action_resource);
					break;

				case CommunityActivityItemTypeGameLink:
				case CommunityActivityItemTypeGameUnlink:
					this.action_resource = new GameModel(data.action_resource);
					break;

				case CommunityActivityItemTypeCompetitionEditSettings:
				case CommunityActivityItemTypeCompetitionEditVoting:
				case CommunityActivityItemTypeCompetitionVotingSetActive:
					this.action_resource = new CommunityCompetitionModel(data.action_resource);
					break;

				case CommunityActivityItemTypeCompetitionEntryRemove:
				case CommunityActivityItemTypeCompetitionEntryUnremove:
				case CommunityActivityItemTypeCompetitionEntryGiveAward:
					this.action_resource = new CommunityCompetitionEntryModel(data.action_resource);
					break;
			}
		}
	}

	public getTypeIcon(): TypeIcon | undefined {
		switch (this.type) {
			case CommunityActivityItemTypeCommunityCreated:
				return { icon: 'heart-filled', color: 'notice' };

			case CommunityActivityItemTypePostFeature:
				return { icon: 'star', color: '' };
			case CommunityActivityItemTypePostUnfeature:
				return { icon: 'star', color: '' };
			case CommunityActivityItemTypePostMove:
				return { icon: 'arrow-forward', color: '' };
			case CommunityActivityItemTypePostEject:
				return { icon: 'eject', color: 'notice' };

			case CommunityActivityItemTypeModInvite:
				return { icon: 'friend-add-1', color: '' };
			case CommunityActivityItemTypeModAccept:
				return { icon: 'friends', color: 'theme' };
			case CommunityActivityItemTypeModRemove:
				return { icon: 'friend-remove-1', color: 'notice' };

			case CommunityActivityItemTypeBlockUser:
				return { icon: 'friend-remove-2', color: 'notice' };

			case CommunityActivityItemTypeEditDescription:
			case CommunityActivityItemTypeEditThumbnail:
			case CommunityActivityItemTypeEditHeader:
			case CommunityActivityItemTypeEditDetails:
			case CommunityActivityItemTypeEditHeaderRemove:
			case CommunityActivityItemTypeCompetitionEditSettings:
			case CommunityActivityItemTypeCompetitionEditVoting:
				return { icon: 'edit', color: '' };

			case CommunityActivityItemTypeChannelAdd:
				return { icon: 'add', color: '' };
			case CommunityActivityItemTypeChannelRemove:
				return { icon: 'remove', color: 'notice' };
			case CommunityActivityItemTypeChannelEdit:
			case CommunityActivityItemTypeChannelRename:
				return { icon: 'edit', color: '' };

			case CommunityActivityItemTypeGameLink:
			case CommunityActivityItemTypeGameUnlink:
				return { icon: 'gamepad', color: '' };

			case CommunityActivityItemTypeCompetitionVotingSetActive:
				return { icon: 'pedestals-numbers', color: '' };

			case CommunityActivityItemTypeCompetitionEntryRemove:
				return { icon: 'bullet-list', color: 'notice' };
			case CommunityActivityItemTypeCompetitionEntryUnremove:
				return { icon: 'bullet-list', color: '' };

			case CommunityActivityItemTypeCompetitionEntryGiveAward:
				return { icon: 'medal', color: '' };
		}
	}
}
