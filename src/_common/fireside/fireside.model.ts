import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { User } from '../user/user.model';

export class Fireside extends Model {
	user!: User;
	hash!: string;
	title!: string;
	expires_on!: number;
	added_on!: number;
	chat_room_id!: number;
	header_media_item: MediaItem | null = null;
	/**
	 * Provided by the backend so it can be checked before trying to join.
	 * Makes sure that user's possibly incorrect local time does not interfere.
	 */
	is_expired!: boolean;
	member_count!: number;

	get blocked() {
		return this.user.blocked_you || this.user.is_blocked;
	}

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}
		if (data.header_media_item) {
			this.header_media_item = new MediaItem(data.header_media_item);
		}
	}

	public isOpen() {
		return !this.is_expired && this.expires_on > Date.now();
	}

	public canJoin() {
		return this.isOpen() && !this.blocked;
	}

	public get location() {
		return {
			name: 'fireside',
			params: {
				hash: this.hash,
			},
		};
	}
}

Model.create(Fireside);
