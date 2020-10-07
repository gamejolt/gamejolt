import { arrayRemove } from '../../utils/array';
import { Community } from '../../_common/community/community.model';

export class CommunityState {
	public communityId: number;

	/** Ids of unread channels. */
	public unreadChannels: number[] = [];
	public hasUnreadPosts = false;
	public hasUnreadFeaturedPosts = false;

	/**
	 * Stores whether this state has been bootstrapped with unread data from the associated
	 * community route. In case it has, the Grid bootstrap cannot overwrite data in this state.
	 */
	public routeBootstrapped = false;

	constructor(communityId: number) {
		this.communityId = communityId;
	}

	get isUnread() {
		return this.hasUnreadPosts || this.unreadChannels.length > 0 || this.hasUnreadFeaturedPosts;
	}

	public markChannelUnread(channelId: number) {
		if (channelId > 0 && !this.unreadChannels.includes(channelId)) {
			this.unreadChannels.push(channelId);
		}
	}

	public markChannelRead(channelId: number) {
		if (this.unreadChannels.includes(channelId)) {
			arrayRemove(this.unreadChannels, i => i === channelId);
		}
	}

	public markAllChannelsRead() {
		while (this.unreadChannels.length > 0) {
			this.unreadChannels.pop();
		}
	}

	public reset() {
		this.unreadChannels = [];
		this.hasUnreadPosts = false;
		this.hasUnreadFeaturedPosts = false;
		this.routeBootstrapped = false;
	}
}

export class CommunityStates {
	states: CommunityState[] = [];

	public getCommunityState(communityInput: number | Community) {
		let communityId: number;
		if (communityInput instanceof Community) {
			communityId = communityInput.id;
		} else {
			communityId = communityInput;
		}

		let state = this.states.find(i => i.communityId === communityId);
		if (!state) {
			state = new CommunityState(communityId);
			this.states.push(state);
		}
		return state;
	}
}
