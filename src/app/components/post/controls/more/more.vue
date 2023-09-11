<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import { FiresidePostCommunityModel } from '../../../../../_common/fireside/post/community/community.model';
import {
	$featureFiresidePost,
	$moveFiresidePostToChannel,
	$rejectFiresidePost,
	$removeFiresidePost,
	$togglePinOnFiresidePost,
	$unfeatureFiresidePost,
	FiresidePostModel,
	FiresidePostStatus,
} from '../../../../../_common/fireside/post/post-model';
import { GameModel } from '../../../../../_common/game/game.model';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import AppPopper from '../../../../../_common/popper/AppPopper.vue';
import { ReportModal } from '../../../../../_common/report/modal/modal.service';
import { copyShareLink } from '../../../../../_common/share/share.service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { UserModel } from '../../../../../_common/user/user.model';
import { arrayRemove } from '../../../../../utils/array';
import { useAppStore } from '../../../../store';
import { CommunityBlockUserModal } from '../../../community/block-user-modal/block-user-modal.service';
import { CommunityEjectPostModal } from '../../../community/eject-post/modal/modal.service';
import { CommunityMovePostModal } from '../../../community/move-post/modal/modal.service';
import { AppCommunityPerms } from '../../../community/perms/perms';
import { useGridStore } from '../../../grid/grid-store';

@Options({
	components: {
		AppPopper,
		AppCommunityPerms,
		AppCommunityThumbnailImg,
	},
})
export default class AppPostControlsMore extends Vue {
	@Prop({ type: Object, required: true })
	post!: FiresidePostModel;

	@Prop({ type: Boolean, default: false })
	overlay!: boolean;

	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	gridStore = setup(() => useGridStore());

	get user() {
		return this.commonStore.user;
	}

	@Emit('remove') emitRemove() {}
	@Emit('feature') emitFeature(_community: CommunityModel) {}
	@Emit('unfeature') emitUnfeature(_community: CommunityModel) {}
	@Emit('move-channel') emitMoveChannel(_movedTo: CommunityChannelModel) {}
	@Emit('reject') emitReject(_community: CommunityModel) {}
	@Emit('pin') emitPin() {}
	@Emit('unpin') emitUnpin() {}

	get canEdit() {
		return this.post.isEditableByUser(this.user);
	}

	get shouldShowManageCommunities() {
		return (
			this.post.status === FiresidePostStatus.Active &&
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

		if (this.post.status !== FiresidePostStatus.Active) {
			return false;
		}

		const pinContext = this.post.getPinContextFor(this.$route);
		if (pinContext instanceof GameModel) {
			return this.canEdit;
		} else if (pinContext instanceof FiresidePostCommunityModel) {
			return pinContext.community.hasPerms('community-posts');
		} else if (pinContext instanceof UserModel) {
			return pinContext.id === this.user.id;
		}

		return false;
	}

	get shouldShowBlockCommunityUser() {
		// Cannot block yourself.
		return this.post.user.id !== this.user?.id;
	}

	async toggleFeatured(postCommunity: FiresidePostCommunityModel) {
		if (postCommunity.isFeatured) {
			await $unfeatureFiresidePost(this.post, postCommunity.community);
			this.emitUnfeature(postCommunity.community);
		} else {
			await $featureFiresidePost(this.post, postCommunity.community);
			this.gridStore.grid?.recordFeaturedPost(this.post);
			this.emitFeature(postCommunity.community);
		}
	}

	async movePostFromCommunityChannel(postCommunity: FiresidePostCommunityModel) {
		let possibleChannels = postCommunity.community.channels;
		if (!possibleChannels) {
			possibleChannels = await this.fetchCommunityChannels(postCommunity.community);
		}

		const result = await CommunityMovePostModal.show(
			postCommunity,
			this.post,
			possibleChannels
		);
		if (!result) {
			return;
		}

		try {
			await $moveFiresidePostToChannel(
				this.post,
				postCommunity.community,
				result.channel,
				result
			);
			this.emitMoveChannel(result.channel);
		} catch (e) {
			console.error('Failed to move community post to a channel');
			console.error(e);
			showErrorGrowl(this.$gettext('Could not move the post, try again later.'));
		}
	}

	private async fetchCommunityChannels(community: CommunityModel) {
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

		return CommunityChannelModel.populate(payload.channels) as CommunityChannelModel[];
	}

	async rejectFromCommunity(postCommunity: FiresidePostCommunityModel) {
		const result = await CommunityEjectPostModal.show(postCommunity, this.post);
		if (!result) {
			return;
		}

		try {
			await $rejectFiresidePost(this.post, postCommunity.community, result);
			// Make sure the post community gets removed from the post.
			// The backend might not return the post resource if the post was already
			// ejected, so the community list doesn't get updated.
			arrayRemove(this.post.communities, i => i.id === postCommunity.id);
			this.emitReject(postCommunity.community);
		} catch (err) {
			console.warn('Failed to eject post');
			return;
		}
	}

	blockFromCommunity(postCommunity: FiresidePostCommunityModel) {
		CommunityBlockUserModal.show(this.post.user, postCommunity.community);
	}

	copyShareUrl() {
		copyShareLink(this.post.url, 'post');
	}

	report() {
		ReportModal.show(this.post);
	}

	async remove() {
		if (await $removeFiresidePost(this.post)) {
			this.emitRemove();
		}
	}

	private _getPinTarget() {
		const pinContext = this.post.getPinContextFor(this.$route);

		let resourceName: string;
		let resourceId: number;

		if (pinContext instanceof GameModel) {
			resourceName = 'Game';
			resourceId = pinContext.id;
		} else if (pinContext instanceof FiresidePostCommunityModel) {
			resourceName = 'Community_Channel';
			resourceId = pinContext.channel!.id;
		} else if (pinContext instanceof UserModel) {
			resourceName = 'User';
			resourceId = pinContext.id;
		} else {
			throw new Error('Post is not pinnable in this context');
		}

		return { resourceName, resourceId };
	}

	async togglePin() {
		const wasPinned = this.post.is_pinned;

		const { resourceName, resourceId } = this._getPinTarget();
		await $togglePinOnFiresidePost(this.post, resourceName, resourceId);
		this.post.is_pinned = !wasPinned;

		if (wasPinned) {
			this.emitUnpin();
		} else {
			this.emitPin();
		}
	}
}
</script>

<template>
	<AppPopper popover-class="fill-darkest">
		<AppButton
			sparse
			circle
			trans
			icon="ellipsis-v"
			:style="
				overlay
					? {
							color: 'white',
							'text-shadow': 'black 1px 1px 4px',
					  }
					: {}
			"
		/>

		<template #popover>
			<div class="list-group list-group-dark">
				<a
					v-app-track-event="`copy-link:post`"
					class="list-group-item has-icon"
					@click="copyShareUrl"
				>
					<AppJolticon icon="link" />
					<AppTranslate>Copy link to post</AppTranslate>
				</a>

				<template v-if="shouldShowPins">
					<a class="list-group-item has-icon" @click="togglePin">
						<AppJolticon icon="thumbtack" />

						<AppTranslate v-if="post.is_pinned">Unpin</AppTranslate>
						<AppTranslate v-else>Pin</AppTranslate>
					</a>
				</template>

				<!-- User reports -->
				<a
					v-if="user && user.id !== post.user.id"
					class="list-group-item has-icon"
					@click="report"
				>
					<AppJolticon icon="flag" />
					<AppTranslate>Report post</AppTranslate>
				</a>

				<!-- Remove -->
				<a v-if="canEdit" class="list-group-item has-icon" @click.stop="remove()">
					<AppJolticon icon="remove" notice />
					<AppTranslate>Remove</AppTranslate>
				</a>

				<!-- Moderate -->
				<a
					v-if="shouldShowModTools"
					class="list-group-item has-icon"
					:href="siteModerateLink"
					target="_blank"
				>
					<AppJolticon icon="cog" />
					<AppTranslate>Moderate</AppTranslate>
				</a>

				<!-- Community feature/unfeature, move to channel and eject -->
				<template v-if="shouldShowManageCommunities">
					<div v-for="i of post.manageableCommunities" :key="i.id">
						<hr />
						<div class="-header">
							<div class="-header-img">
								<AppCommunityThumbnailImg :community="i.community" />
							</div>
							{{ i.community.name }}
						</div>
						<AppCommunityPerms :community="i.community" required="community-features">
							<a class="list-group-item has-icon" @click.stop="toggleFeatured(i)">
								<AppJolticon icon="star" />
								<template v-if="i.isFeatured">
									<AppTranslate
										:translate-params="{ community: i.community.name }"
									>
										Unfeature from %{ community }
									</AppTranslate>
								</template>
								<template v-else>
									<AppTranslate
										:translate-params="{ community: i.community.name }"
									>
										Feature in %{ community }
									</AppTranslate>
								</template>
							</a>
						</AppCommunityPerms>

						<AppCommunityPerms :community="i.community" required="community-posts">
							<a
								class="list-group-item has-icon"
								@click.stop="movePostFromCommunityChannel(i)"
							>
								<AppJolticon icon="arrow-forward" />
								<AppTranslate>Move to a different channel</AppTranslate>
							</a>

							<a
								class="list-group-item has-icon"
								@click.stop="rejectFromCommunity(i)"
							>
								<AppJolticon icon="eject" />

								<AppTranslate :translate-params="{ community: i.community.name }">
									Eject from %{ community }
								</AppTranslate>
							</a>
						</AppCommunityPerms>

						<AppCommunityPerms
							v-if="shouldShowBlockCommunityUser"
							:community="i.community"
							required="community-blocks"
						>
							<a class="list-group-item has-icon" @click.stop="blockFromCommunity(i)">
								<AppJolticon icon="friend-remove-2" />
								<AppTranslate :translate-params="{ community: i.community.name }">
									Block author from %{ community }
								</AppTranslate>
							</a>
						</AppCommunityPerms>
					</div>
				</template>
			</div>
		</template>
	</AppPopper>
</template>

<style lang="stylus" scoped>
.-header
	display: flex
	align-items: center
	font-size: $font-size-tiny
	font-weight: normal
	letter-spacing: 0.1em
	line-height: 1
	text-transform: uppercase
	padding: $list-group-item-padding
	padding-left: 0

.-header-img
	width: 20px
	height: 20px
	margin-left: $list-group-item-padding
	margin-right: $list-group-item-padding
</style>
