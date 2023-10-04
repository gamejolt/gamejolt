import { FiresideModel } from '../../fireside/fireside.model';
import { FiresidePostModel } from '../../fireside/post/post-model';
import { GameModel } from '../../game/game.model';
import { Jolticon } from '../../jolticon/AppJolticon.vue';
import { Model } from '../../model/model.service';
import { UserBlockModel } from '../../user/block/block.model';
import { UserModel } from '../../user/user.model';
import { CommunityChannelModel } from '../channel/channel.model';
import { CommunityCompetitionModel } from '../competition/competition.model';
import { CommunityCompetitionEntryModel } from '../competition/entry/entry.model';

type TypeIcon = {
	icon: Jolticon;
	color: string;
};

export const enum CommunityActivityItemType {
	CommunityCreated = 'community/created',

	PostFeature = 'post/feature',
	PostUnfeature = 'post/unfeature',
	PostMove = 'post/move',
	PostEject = 'post/eject',

	ModInvite = 'mod/invite',
	ModAccept = 'mod/accept',
	ModRemove = 'mod/remove',

	BlockUser = 'block/user',

	EditDescription = 'edit/description',
	EditThumbnail = 'edit/thumbnail',
	EditHeader = 'edit/header',
	EditDetails = 'edit/details',
	EditHeaderRemove = 'edit/header/remove',

	ChannelAdd = 'channel/add',
	ChannelRemove = 'channel/remove',
	ChannelEdit = 'channel/edit',
	ChannelRename = 'channel/rename',

	GameLink = 'game/link',
	GameUnlink = 'game/unlink',

	CompetitionEditSettings = 'competition/edit/settings',
	CompetitionEditVoting = 'competition/edit/voting',
	CompetitionVotingSetActive = 'competition/voting/set-active',
	CompetitionEntryRemove = 'competition/entry/remove',
	CompetitionEntryUnremove = 'competition/entry/unremove',
	CompetitionEntryGiveAward = 'competition/entry/give-award',

	FiresideStart = 'fireside/start',
	FiresideStartDraft = 'fireside/start-draft',
	FiresidePublish = 'fireside/publish',
	FiresideExtinguish = 'fireside/extinguish',
	FiresideFeature = 'fireside/feature',
	FiresideUnfeature = 'fireside/unfeature',
	FiresideEject = 'fireside/eject',
}

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
		| CommunityCompetitionEntryModel
		| FiresideModel;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}

		if (data.action_resource) {
			switch (this.type) {
				case CommunityActivityItemType.PostFeature:
				case CommunityActivityItemType.PostUnfeature:
				case CommunityActivityItemType.PostMove:
				case CommunityActivityItemType.PostEject:
					this.action_resource = new FiresidePostModel(data.action_resource);
					break;

				case CommunityActivityItemType.ModInvite:
				case CommunityActivityItemType.ModAccept:
				case CommunityActivityItemType.ModRemove:
					this.action_resource = new UserModel(data.action_resource);
					break;

				case CommunityActivityItemType.BlockUser:
					this.action_resource = new UserBlockModel(data.action_resource);
					break;

				case CommunityActivityItemType.ChannelAdd:
				case CommunityActivityItemType.ChannelEdit:
				case CommunityActivityItemType.ChannelRename:
					this.action_resource = new CommunityChannelModel(data.action_resource);
					break;

				case CommunityActivityItemType.GameLink:
				case CommunityActivityItemType.GameUnlink:
					this.action_resource = new GameModel(data.action_resource);
					break;

				case CommunityActivityItemType.CompetitionEditSettings:
				case CommunityActivityItemType.CompetitionEditVoting:
				case CommunityActivityItemType.CompetitionVotingSetActive:
					this.action_resource = new CommunityCompetitionModel(data.action_resource);
					break;

				case CommunityActivityItemType.CompetitionEntryRemove:
				case CommunityActivityItemType.CompetitionEntryUnremove:
				case CommunityActivityItemType.CompetitionEntryGiveAward:
					this.action_resource = new CommunityCompetitionEntryModel(data.action_resource);
					break;

				case CommunityActivityItemType.FiresideStart:
				case CommunityActivityItemType.FiresideStartDraft:
				case CommunityActivityItemType.FiresidePublish:
				case CommunityActivityItemType.FiresideExtinguish:
				case CommunityActivityItemType.FiresideFeature:
				case CommunityActivityItemType.FiresideUnfeature:
				case CommunityActivityItemType.FiresideEject:
					this.action_resource = new FiresideModel(data.action_resource);
					break;
			}
		}
	}

	public getTypeIcon(): TypeIcon | undefined {
		switch (this.type) {
			case CommunityActivityItemType.CommunityCreated:
				return { icon: 'heart-filled', color: 'notice' };

			case CommunityActivityItemType.PostFeature:
			case CommunityActivityItemType.FiresideFeature:
				return { icon: 'star', color: '' };
			case CommunityActivityItemType.PostUnfeature:
			case CommunityActivityItemType.FiresideUnfeature:
				return { icon: 'star', color: '' };
			case CommunityActivityItemType.PostMove:
				return { icon: 'arrow-forward', color: '' };
			case CommunityActivityItemType.PostEject:
			case CommunityActivityItemType.FiresideEject:
				return { icon: 'eject', color: 'notice' };

			case CommunityActivityItemType.ModInvite:
				return { icon: 'friend-add-1', color: '' };
			case CommunityActivityItemType.ModAccept:
				return { icon: 'friends', color: 'theme' };
			case CommunityActivityItemType.ModRemove:
				return { icon: 'friend-remove-1', color: 'notice' };

			case CommunityActivityItemType.BlockUser:
				return { icon: 'friend-remove-2', color: 'notice' };

			case CommunityActivityItemType.EditDescription:
			case CommunityActivityItemType.EditThumbnail:
			case CommunityActivityItemType.EditHeader:
			case CommunityActivityItemType.EditDetails:
			case CommunityActivityItemType.EditHeaderRemove:
			case CommunityActivityItemType.CompetitionEditSettings:
			case CommunityActivityItemType.CompetitionEditVoting:
				return { icon: 'edit', color: '' };

			case CommunityActivityItemType.ChannelAdd:
				return { icon: 'add', color: '' };
			case CommunityActivityItemType.ChannelRemove:
				return { icon: 'remove', color: 'notice' };
			case CommunityActivityItemType.ChannelEdit:
			case CommunityActivityItemType.ChannelRename:
				return { icon: 'edit', color: '' };

			case CommunityActivityItemType.GameLink:
			case CommunityActivityItemType.GameUnlink:
				return { icon: 'gamepad', color: '' };

			case CommunityActivityItemType.CompetitionVotingSetActive:
				return { icon: 'pedestals-numbers', color: '' };

			case CommunityActivityItemType.CompetitionEntryRemove:
				return { icon: 'bullet-list', color: 'notice' };
			case CommunityActivityItemType.CompetitionEntryUnremove:
				return { icon: 'bullet-list', color: '' };

			case CommunityActivityItemType.CompetitionEntryGiveAward:
				return { icon: 'medal', color: '' };

			case CommunityActivityItemType.FiresideStart:
			case CommunityActivityItemType.FiresideStartDraft:
			case CommunityActivityItemType.FiresidePublish:
				return { icon: 'fireside', color: '' };
			case CommunityActivityItemType.FiresideExtinguish:
				return { icon: 'remove', color: '' };
		}
	}
}
