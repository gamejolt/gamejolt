import { Location } from 'vue-router';
import { Api } from '../api/api.service';
import { Collaboratable, Perm } from '../collaborator/collaboratable';
import { Game } from '../game/game.model';
import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { Theme } from '../theme/theme.model';
import { CommunityChannel } from './channel/channel.model';

export async function $joinCommunity(community: Community) {
	community.is_member = true;
	++community.member_count;

	try {
		const response = await Api.sendRequest(
			'/web/communities/join/' + community.path,
			{},
			{ detach: true }
		);

		return response;
	} catch (e) {
		community.is_member = false;
		--community.member_count;
		throw e;
	}
}

export async function $leaveCommunity(community: Community) {
	community.is_member = false;
	--community.member_count;

	try {
		const response = await Api.sendRequest(
			'/web/communities/leave/' + community.path,
			{},
			{ detach: true }
		);

		return response;
	} catch (e) {
		throw e;
	}
}

export class Community extends Collaboratable(Model) {
	name!: string;
	path!: string;
	added_on!: number;
	post_placeholder_text!: string | null;
	description_content!: string;

	thumbnail?: MediaItem;
	header?: MediaItem;
	theme!: Theme | null;
	game!: Game | null;
	channels?: CommunityChannel[] | null;

	member_count!: number;
	is_member?: boolean;

	perms?: Perm[];

	constructor(data: any = {}) {
		super(data);

		if (data.header) {
			this.header = new MediaItem(data.header);
		}

		if (data.thumbnail) {
			this.thumbnail = new MediaItem(data.thumbnail);
		}

		if (data.theme) {
			this.theme = new Theme(data.theme);
		}

		if (data.game) {
			this.game = new Game(data.game);
		}

		if (data.channels) {
			this.channels = CommunityChannel.populate(data.channels);
		}
	}

	get img_thumbnail() {
		if (this.thumbnail instanceof MediaItem) {
			return this.thumbnail.mediaserver_url;
		}
		return require('./no-thumb.png');
	}

	get routeLocation(): Location {
		return {
			name: 'communities.view.overview',
			params: {
				path: this.path,
			},
		};
	}

	channelRouteLocation(channel: CommunityChannel): Location {
		const communityLocation = this.routeLocation;
		communityLocation.params!.channel = channel.title;
		return communityLocation;
	}

	$save() {
		return this.$_save('/web/dash/communities/save/' + this.id, 'community');
	}

	$saveHeader() {
		return this.$_save('/web/dash/communities/design/save-header/' + this.id, 'community', {
			file: this.file,
			allowComplexData: ['crop'],
		});
	}

	$saveThumbnail() {
		return this.$_save('/web/dash/communities/design/save-thumbnail/' + this.id, 'community', {
			file: this.file,
			allowComplexData: ['crop'],
		});
	}

	$saveDetails() {
		return this.$_save('/web/dash/communities/details/save/' + this.id, 'community');
	}

	$saveDescription() {
		return this.$_save('/web/dash/communities/description/save/' + this.id, 'community');
	}
}

Model.create(Community);
