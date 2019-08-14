import { RawLocation } from 'vue-router';
import { Api } from '../../components/api/api.service';
import { CommunityTag } from '../../components/community/tag/tag.model';
import { MediaItem } from '../../components/media-item/media-item-model';
import { Model } from '../../components/model/model.service';
import { Theme } from '../../components/theme/theme.model';
import { Collaboratable, Perm } from '../collaborator/collaboratable';
import { Game } from '../game/game.model';

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

	thumbnail?: MediaItem;
	header?: MediaItem;
	theme!: Theme | null;
	game!: Game | null;
	tags?: CommunityTag[] | null;

	member_count!: number;
	is_member?: boolean;

	perms?: Perm[];

	is_unread = false;

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

		if (data.tags) {
			this.tags = CommunityTag.populate(data.tags);
		}
	}

	get img_thumbnail() {
		if (this.thumbnail instanceof MediaItem) {
			return this.thumbnail.mediaserver_url;
		}
		return require('./no-thumb.png');
	}

	get routeLocation(): RawLocation {
		return {
			name: 'communities.view.overview',
			params: {
				path: this.path,
			},
		};
	}

	$save() {
		return this.$_save('/web/dash/communities/save/' + this.id, 'community');
	}

	$saveThumbnail() {
		return this.$_save('/web/dash/communities/design/save-thumbnail/' + this.id, 'community', {
			file: this.file,
			allowComplexData: ['crop'],
		});
	}
}

Model.create(Community);
