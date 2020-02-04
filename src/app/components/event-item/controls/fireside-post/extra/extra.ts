import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Mutation } from 'vuex-class';
import { Api } from '../../../../../../_common/api/api.service';
import { Clipboard } from '../../../../../../_common/clipboard/clipboard-service';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import { Environment } from '../../../../../../_common/environment/environment.service';
import { FiresidePostCommunity } from '../../../../../../_common/fireside/post/community/community.model';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { Game } from '../../../../../../_common/game/game.model';
import { Growls } from '../../../../../../_common/growls/growls.service';
import { getLinkedAccountPlatformIcon } from '../../../../../../_common/linked-account/linked-account.model';
import AppPopper from '../../../../../../_common/popper/popper.vue';
import { ReportModal } from '../../../../../../_common/report/modal/modal.service';
import { AppState, AppStore } from '../../../../../../_common/store/app-store';
import { User } from '../../../../../../_common/user/user.model';
import { Store } from '../../../../../store/index';
import { CommunityMovePostModal } from '../../../../community/move-post/modal/modal.service';
import { AppCommunityPerms } from '../../../../community/perms/perms';

@Component({
	components: {
		AppPopper,
		AppCommunityPerms,
	},
})
export default class AppEventItemControlsFiresidePostExtra extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@AppState
	user!: AppStore['user'];

	@Mutation
	featuredPost!: Store['featuredPost'];

	@Emit('remove')
	emitRemove() {}

	@Emit('feature')
	emitFeature(_community: Community) {}

	@Emit('unfeature')
	emitUnfeature(_community: Community) {}

	@Emit('move-channel')
	emitMoveChannel(_movedTo: CommunityChannel) {}

	@Emit('reject')
	emitReject(_community: Community) {}

	@Emit('pin')
	emitPin() {}

	@Emit('unpin')
	emitUnpin() {}

	get canEdit() {
		return this.post.isEditableByUser(this.user);
	}

	get shouldShowManageCommunities() {
		return (
			this.post.status === FiresidePost.STATUS_ACTIVE &&
			this.post.manageableCommunities.length !== 0
		);
	}

	get shouldShowModTools() {
		return this.user && this.user.isMod;
	}

	get siteModerateLink() {
		return Environment.baseUrl + `/moderate/fireside-posts/view/${this.post.id}`;
	}

	get shouldShowPins() {
		// Has to be in the correct context for the post to appear pinnable.
		// Only active posts can be pinned.
		// Permissions:
		// A game post can be pinned by the game owner or the game's collaborator with the devlogs permission.
		// A user post can be pinned to the user by only the user themselves.
		// A user post can be pinned to a community channel by a community collaborator (including owner) with the community-posts permission.

		if (!this.user) {
			return false;
		}

		if (this.post.status !== FiresidePost.STATUS_ACTIVE) {
			return false;
		}

		const pinContext = this.post.getPinContextFor(this.$route);
		if (pinContext instanceof Game) {
			return this.canEdit;
		} else if (pinContext instanceof FiresidePostCommunity) {
			return pinContext.community.hasPerms('community-posts');
		} else if (pinContext instanceof User) {
			return pinContext.id === this.user.id;
		}

		return false;
	}

	shouldDisplayCommunityName(community: Community) {
		// If we are in the community in question and it's the only community option available
		return (
			this.post.manageableCommunities.length === 1 &&
			!(
				this.$route.name &&
				this.$route.name.includes('communities.view') &&
				this.$route.params.path === community.path
			)
		);
	}

	getProviderIcon(provider: string) {
		return getLinkedAccountPlatformIcon(provider);
	}

	async toggleFeatured(postCommunity: FiresidePostCommunity) {
		if (postCommunity.isFeatured) {
			await this.post.$unfeature(postCommunity.community);
			this.emitUnfeature(postCommunity.community);
		} else {
			await this.post.$feature(postCommunity.community);
			this.featuredPost(this.post);
			this.emitFeature(postCommunity.community);
		}
	}

	async movePostFromCommunityChannel(postCommunity: FiresidePostCommunity) {
		let possibleChannels = postCommunity.community.channels;
		if (!possibleChannels) {
			possibleChannels = await this.fetchCommunityChannels(postCommunity.community);
		}

		const channel = await CommunityMovePostModal.show(postCommunity, possibleChannels);
		if (!channel) {
			return;
		}

		try {
			await this.post.$moveChannel(postCommunity.community, channel);
			this.emitMoveChannel(channel);
		} catch (e) {
			console.error('Failed to move community post to a channel');
			console.error(e);
			Growls.error(this.$gettext('Could not move the post, try again later.'));
		}
	}

	private async fetchCommunityChannels(community: Community) {
		const payload = await Api.sendRequest(
			`/web/communities/manage/list-channels/${community.id}`,
			null,
			{
				detach: true,
			}
		);

		if (!payload || !payload.success) {
			throw new Error('Could not fetch community channels');
		}

		return CommunityChannel.populate(payload.channels) as CommunityChannel[];
	}

	async rejectFromCommunity(postCommunity: FiresidePostCommunity) {
		await this.post.$reject(postCommunity.community);
		this.emitReject(postCommunity.community);
	}

	copyShareUrl() {
		Clipboard.copy(this.post.url);
	}

	report() {
		ReportModal.show(this.post);
	}

	async remove() {
		if (await this.post.remove()) {
			this.emitRemove();
		}
	}

	getPinTargetModel() {
		const pinContext = this.post.getPinContextFor(this.$route);
		if (pinContext instanceof Game) {
			return 'Game';
		} else if (pinContext instanceof FiresidePostCommunity) {
			return 'Community_Channel';
		} else if (pinContext instanceof User) {
			return 'User';
		}

		throw new Error('Post is not pinnable in this context');
	}

	async pin() {
		await this.post.$pin(this.getPinTargetModel());
		this.emitPin();
	}

	async unpin() {
		await this.post.$unpin(this.getPinTargetModel());
		this.emitUnpin();
	}
}
