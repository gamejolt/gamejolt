import { arrayRemove } from '../../utils/array';
import { Community } from '../../_common/community/community.model';

export class CommunityState {
	public communityId: number;

	/** Ids of unread channels. */
	public unreadChannels: number[] = [];
	public hasUnreadPosts = false;
	public unreadFeatureCount = 0;

	constructor(communityId: number) {
		this.communityId = communityId;
	}

	get isUnread() {
		return this.hasUnreadPosts || this.unreadChannels.length > 0;
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

	public reset() {
		this.unreadChannels = [];
		this.hasUnreadPosts = false;
		this.unreadFeatureCount = 0;
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
