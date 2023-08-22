import { getCurrentServerTime } from '../../utils/server-time';
import { Api } from '../api/api.service';
import { Collaboratable } from '../collaborator/collaboratable';
import { MediaItem } from '../media-item/media-item-model';
import { defineLegacyModel, Model } from '../model/model.service';
import { Screen } from '../screen/screen-service';
import { constructStickerCounts, StickerCount } from '../sticker/sticker-count';
import { Sticker } from '../sticker/sticker.model';
import { UserBlock } from '../user/block/block.model';
import { User } from '../user/user.model';
import { FiresideCommunity } from './community/community.model';
import { FiresideRealm } from './realm/realm.model';
import { FiresideRole } from './role/role.model';

export class Fireside extends defineLegacyModel(
	class FiresideDefinition extends Collaboratable(Model) {
		declare user: User;
		community_links: FiresideCommunity[] = [];
		realms: FiresideRealm[] = [];
		header_media_item: MediaItem | null = null;
		role: FiresideRole | null = null;
		declare user_block?: UserBlock | null;
		sticker_counts: StickerCount[] = [];
		declare hash: string;
		declare title: string;
		declare expires_on: number;
		declare added_on: number;
		declare chat_room_id: number;
		/**
		 * Provided by the backend so it can be checked before trying to join.
		 * Makes sure that user's possibly incorrect local time does not interfere.
		 */
		declare is_expired: boolean;
		declare is_streaming: boolean;
		declare member_count: number;
		declare is_draft: boolean;

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

			if (data.realms) {
				this.realms = FiresideRealm.populate(data.realms);
			}

			if (data.sticker_counts) {
				this.sticker_counts = constructStickerCounts(data.sticker_counts);
			}
		}

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

		get hasRealms() {
			return this.realms.length !== 0;
		}

		get primaryRealmLink() {
			if (this.hasRealms) {
				return this.realms[0];
			}
			return null;
		}

		get realm() {
			return this.primaryRealmLink?.realm ?? null;
		}

		isOpen() {
			return !this.is_expired && this.expires_on > getCurrentServerTime();
		}

		canJoin() {
			return this.isOpen() && !this.blocked;
		}

		getExpiryInMs() {
			return this.expires_on - getCurrentServerTime();
		}

		addStickerToCount(sticker: Sticker, isCharged: boolean) {
			const existingEntry = this.sticker_counts.find(i => i.stickerId === sticker.id);
			const chargeCount = isCharged ? 1 : 0;

			if (existingEntry) {
				existingEntry.count++;
				existingEntry.chargedCount += chargeCount;
			} else {
				this.sticker_counts.push({
					stickerId: sticker.id,
					imgUrl: sticker.img_url,
					count: 1,
					chargedCount: chargeCount,
				});
			}
		}

		$save() {
			return this.$_save(`/web/dash/fireside/save/` + this.hash, 'fireside');
		}

		$saveWithRealms(realmIds: number[]) {
			return this.$_save(`/web/dash/fireside/save/${this.hash}`, 'fireside', {
				data: {
					title: this.title,
					realm_ids: realmIds,
				},
				allowComplexData: ['realm_ids'],
			});
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
) {}

export function inviteFiresideHost(fireside: Fireside, hostId: number) {
	return Api.sendRequest(`/web/dash/fireside/add-host/${fireside.id}`, { host_id: hostId });
}

export function removeFiresideHost(fireside: Fireside, hostId: number) {
	return Api.sendRequest(`/web/dash/fireside/remove-host/${fireside.id}`, { host_id: hostId });
}

export function canDeviceViewFiresides() {
	return Screen.isDesktop;
}

export function canDeviceCreateFiresides() {
	return canDeviceViewFiresides();
}
