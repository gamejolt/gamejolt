import { getCurrentServerTime } from '../../utils/server-time';
import { Api } from '../api/api.service';
import { Collaboratable } from '../collaborator/collaboratable';
import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { constructStickerCounts, StickerCount } from '../sticker/sticker-count';
import { Sticker } from '../sticker/sticker.model';
import { UserBlock } from '../user/block/block.model';
import { User } from '../user/user.model';
import { FiresideCommunity } from './community/community.model';
import { FiresideRole } from './role/role.model';

export class Fireside extends Collaboratable(Model) {
	user!: User;
	community_links: FiresideCommunity[] = [];
	header_media_item: MediaItem | null = null;
	role: FiresideRole | null = null;
	user_block?: UserBlock | null;
	sticker_counts: StickerCount[] = [];

	hash!: string;
	title!: string;
	expires_on!: number;
	added_on!: number;
	chat_room_id!: number;
	/**
	 * Provided by the backend so it can be checked before trying to join.
	 * Makes sure that user's possibly incorrect local time does not interfere.
	 */
	is_expired!: boolean;
	is_streaming!: boolean;
	member_count!: number;
	is_draft!: boolean;

	get blocked() {
		return !!this.user_block || this.user.blocked_you || this.user.is_blocked;
	}

	get routeLocation() {
		return {
			name: 'fireside',
			params: {
				hash: this.hash,
			},
		};
	}

	get community() {
		return this.primaryCommunityLink?.community ?? null;
	}

	get primaryCommunityLink() {
		if (this.community_links.length > 0) {
			return this.community_links[0];
		}
		return null;
	}

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.header_media_item) {
			this.header_media_item = new MediaItem(data.header_media_item);
		}

		if (data.user_block) {
			this.user_block = new UserBlock(data.user_block);
		}

		if (data.role) {
			this.role = new FiresideRole(data.role);
		}

		if (data.community_links) {
			this.community_links = FiresideCommunity.populate(data.community_links);
		}

		if (data.sticker_counts) {
			this.sticker_counts = constructStickerCounts(data.sticker_counts);
		}
	}

	public isOpen() {
		return !this.is_expired && this.expires_on > getCurrentServerTime();
	}

	public canJoin() {
		return this.isOpen() && !this.blocked;
	}

	public getExpiryInMs() {
		return this.expires_on - getCurrentServerTime();
	}

	public addStickerToCount(sticker: Sticker) {
		const existingEntry = this.sticker_counts.find(i => i.stickerId === sticker.id);
		if (existingEntry) {
			existingEntry.count++;
		} else {
			this.sticker_counts.push({
				stickerId: sticker.id,
				imgUrl: sticker.img_url,
				count: 1,
			});
		}
	}

	$save() {
		return this.$_save(`/web/dash/fireside/save/` + this.hash, 'fireside');
	}

	$publish({ autoFeature }: { autoFeature?: boolean } = {}) {
		return this.$_save(`/web/dash/fireside/publish/` + this.hash, 'fireside', {
			data: {
				auto_feature: autoFeature ?? false,
			},
		});
	}

	$extinguish() {
		return this.$_save(`/web/dash/fireside/extinguish/` + this.hash, 'fireside');
	}

	$feature() {
		if (!this.primaryCommunityLink) {
			return;
		}
		return this.$_save(
			`/web/communities/manage/feature-fireside/${this.primaryCommunityLink.id}`,
			'fireside'
		);
	}

	$unfeature() {
		if (!this.primaryCommunityLink) {
			return;
		}
		return this.$_save(
			`/web/communities/manage/unfeature-fireside/${this.primaryCommunityLink.id}`,
			'fireside'
		);
	}
}

Model.create(Fireside);

export function inviteFiresideHost(fireside: Fireside, hostId: number) {
	return Api.sendRequest(`/web/dash/fireside/add-host/${fireside.id}`, { host_id: hostId });
}

export function removeFiresideHost(fireside: Fireside, hostId: number) {
	return Api.sendRequest(`/web/dash/fireside/remove-host/${fireside.id}`, { host_id: hostId });
}
