import { Community } from '../community/community.model';
import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { UserBlock } from '../user/block/block.model';
import { User } from '../user/user.model';
import { FiresideRole } from './role/role.model';

/** The time remaining in seconds when we want to show expiry warnings */
export const FIRESIDE_EXPIRY_THRESHOLD = 60;

export class Fireside extends Model {
	user!: User;
	community!: Community;
	header_media_item: MediaItem | null = null;
	role: FiresideRole | null = null;
	user_block?: UserBlock | null;

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

	get location() {
		return {
			name: 'fireside',
			params: {
				hash: this.hash,
			},
		};
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

		if (data.community) {
			this.community = new Community(data.community);
		}
	}

	public isOpen() {
		return !this.is_expired && this.expires_on > Date.now();
	}

	public canJoin() {
		return this.isOpen() && !this.blocked;
	}

	public getExpiryInMs() {
		return this.expires_on - Date.now();
	}

	$save() {
		return this.$_save(`/web/dash/fireside/save/` + this.hash, 'fireside');
	}

	$publish() {
		return this.$_save(`/web/dash/fireside/publish/` + this.hash, 'fireside');
	}

	$extinguish() {
		return this.$_save(`/web/dash/fireside/extinguish/` + this.hash, 'fireside');
	}
}

Model.create(Fireside);
