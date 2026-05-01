<script lang="ts" setup>
import { computed, toRef } from 'vue';
import { useRoute } from 'vue-router';

import { showCommunityBlockUserModal } from '~app/components/community/block-user-modal/block-user-modal.service';
import { showCommunityEjectPostModal } from '~app/components/community/eject-post/modal/modal.service';
import { showCommunityMovePostModal } from '~app/components/community/move-post/modal/modal.service';
import AppCommunityPerms from '~app/components/community/perms/AppCommunityPerms.vue';
import { useGridStore } from '~app/components/grid/grid-store';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { showCollectibleResourceDetailsModal } from '~common/collectible/resource-details-modal/modal.service';
import { CommunityChannelModel } from '~common/community/channel/channel.model';
import { CommunityModel } from '~common/community/community.model';
import AppCommunityThumbnailImg from '~common/community/thumbnail/AppCommunityThumbnailImg.vue';
import { BaseUrl } from '~common/environment/environment.service';
import { FiresidePostCommunityModel } from '~common/fireside/post/community/community.model';
import {
	$featureFiresidePost,
	$moveFiresidePostToChannel,
	$rejectFiresidePost,
	$removeFiresidePost,
	$togglePinOnFiresidePost,
	$unfeatureFiresidePost,
	FiresidePostModel,
	FiresidePostStatus,
} from '~common/fireside/post/post-model';
import { GameModel } from '~common/game/game.model';
import { showErrorGrowl } from '~common/growls/growls.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppPopper from '~common/popper/AppPopper.vue';
import { showReportModal } from '~common/report/modal/modal.service';
import { copyShareLink } from '~common/share/share.service';
import { useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';
import { styleWhen } from '~styles/mixins';
import { kFontSizeTiny } from '~styles/variables';
import { arrayRemove } from '~utils/array';

type Props = {
	post: FiresidePostModel;
	overlay?: boolean;
};
const { post, overlay } = defineProps<Props>();

const route = useRoute();

const { user: sessionUser } = useCommonStore();
const { grid } = useGridStore();

const emit = defineEmits<{
	remove: [];
	feature: [community: CommunityModel];
	unfeature: [community: CommunityModel];
	'move-channel': [movedTo: CommunityChannelModel];
	reject: [community: CommunityModel];
	pin: [];
	unpin: [];
}>();

const canEdit = toRef(() => post.isEditableByUser(sessionUser.value));
const shouldShowManageCommunities = toRef(
	() => post.status === FiresidePostStatus.Active && post.manageableCommunities.length !== 0
);
const shouldShowModTools = toRef(() => sessionUser.value && sessionUser.value.isMod);
const siteModerateLink = toRef(() => BaseUrl + `/moderate/fireside-posts/view/${post.id}`);
const avatarFrame = toRef(() => post.displayUser.avatar_frame);
const shouldShowBlockCommunityUser = toRef(() => {
	// Cannot block yourself.
	return post.user.id !== sessionUser.value?.id;
});

const shouldShowPins = computed(() => {
	// Has to be in the correct context for the post to appear pinnable. Only
	// active posts can be pinned.
	//
	// Permissions:
	// - A game post can be pinned by the game owner or the game's collaborator
	//   with the devlogs permission.
	// - A user post can be pinned to the user by only the user themselves.
	// - A user post can be pinned to a community channel by a community
	//   collaborator (including owner) with the community-posts permission.
	if (!sessionUser.value) {
		return false;
	}

	if (post.status !== FiresidePostStatus.Active) {
		return false;
	}

	const pinContext = post.getPinContextFor(route);
	if (pinContext instanceof GameModel) {
		return canEdit.value;
	} else if (pinContext instanceof FiresidePostCommunityModel) {
		return pinContext.community.hasPerms('community-posts');
	} else if (pinContext instanceof UserModel) {
		return pinContext.id === sessionUser.value.id;
	}

	return false;
});

async function toggleFeatured(postCommunity: FiresidePostCommunityModel) {
	if (postCommunity.isFeatured) {
		await $unfeatureFiresidePost(post, postCommunity.community);
		emit('unfeature', postCommunity.community);
	} else {
		await $featureFiresidePost(post, postCommunity.community);
		grid.value?.recordFeaturedPost(post);
		emit('feature', postCommunity.community);
	}
}

async function movePostFromCommunityChannel(postCommunity: FiresidePostCommunityModel) {
	let possibleChannels = postCommunity.community.channels;
	if (!possibleChannels) {
		possibleChannels = await fetchCommunityChannels(postCommunity.community);
	}

	const result = await showCommunityMovePostModal(postCommunity, post, possibleChannels);
	if (!result) {
		return;
	}

	try {
		await $moveFiresidePostToChannel(post, postCommunity.community, result.channel, result);
		emit('move-channel', result.channel);
	} catch (e) {
		console.error('Failed to move community post to a channel');
		console.error(e);
		showErrorGrowl($gettext('Could not move the post, try again later.'));
	}
}

async function fetchCommunityChannels(community: CommunityModel) {
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

async function rejectFromCommunity(postCommunity: FiresidePostCommunityModel) {
	const result = await showCommunityEjectPostModal(postCommunity, post);
	if (!result) {
		return;
	}

	try {
		await $rejectFiresidePost(post, postCommunity.community, result);
		// Make sure the post community gets removed from the post.
		// The backend might not return the post resource if the post was already
		// ejected, so the community list doesn't get updated.
		arrayRemove(post.communities, i => i.id === postCommunity.id);
		emit('reject', postCommunity.community);
	} catch (err) {
		console.warn('Failed to eject post');
		return;
	}
}

function blockFromCommunity(postCommunity: FiresidePostCommunityModel) {
	showCommunityBlockUserModal(post.user, postCommunity.community);
}

function copyShareUrl() {
	copyShareLink(post.url, 'post');
}

function report() {
	showReportModal(post);
}

async function remove() {
	if (await $removeFiresidePost(post)) {
		emit('remove');
	}
}

function _getPinTarget() {
	const pinContext = post.getPinContextFor(route);

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

async function togglePin() {
	const wasPinned = post.is_pinned;

	const { resourceName, resourceId } = _getPinTarget();
	await $togglePinOnFiresidePost(post, resourceName, resourceId);

	post.is_pinned = !wasPinned;

	if (wasPinned) {
		emit('unpin');
	} else {
		emit('pin');
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
			:style="{
				...styleWhen(overlay, {
					color: 'white',
					'text-shadow': 'black 1px 1px 4px',
				}),
			}"
		/>

		<template #popover>
			<div class="list-group list-group-dark">
				<a class="list-group-item has-icon" @click="copyShareUrl">
					<AppJolticon icon="link" />
					{{ $gettext(`Copy link to post`) }}
				</a>

				<template v-if="avatarFrame">
					<a
						class="list-group-item has-icon"
						@click="showCollectibleResourceDetailsModal({ item: avatarFrame })"
					>
						<AppJolticon icon="subscribe" />
						{{ $gettext(`View avatar frame`) }}
					</a>
				</template>

				<template v-if="post.background">
					<a
						class="list-group-item has-icon"
						@click="showCollectibleResourceDetailsModal({ item: post.background })"
					>
						<AppJolticon icon="subscribe" />
						{{ $gettext(`View background`) }}
					</a>
				</template>

				<template v-if="shouldShowPins">
					<a class="list-group-item has-icon" @click="togglePin">
						<AppJolticon icon="thumbtack" />

						<template v-if="post.is_pinned">{{ $gettext(`Unpin`) }}</template>
						<template v-else>{{ $gettext(`Pin`) }}</template>
					</a>
				</template>

				<!-- User reports -->
				<a
					v-if="sessionUser && sessionUser.id !== post.user.id"
					class="list-group-item has-icon"
					@click="report"
				>
					<AppJolticon icon="flag" />
					{{ $gettext(`Report post`) }}
				</a>

				<!-- Remove -->
				<a v-if="canEdit" class="list-group-item has-icon" @click.stop="remove()">
					<AppJolticon icon="remove" notice />
					{{ $gettext(`Remove`) }}
				</a>

				<!-- Moderate -->
				<a
					v-if="shouldShowModTools"
					class="list-group-item has-icon"
					:href="siteModerateLink"
					target="_blank"
				>
					<AppJolticon icon="cog" />
					{{ $gettext(`Moderate`) }}
				</a>

				<!-- Community feature/unfeature, move to channel and eject -->
				<template v-if="shouldShowManageCommunities">
					<div v-for="i of post.manageableCommunities" :key="i.id">
						<hr />
						<div
							class="_header"
							:style="{
								display: `flex`,
								alignItems: `center`,
								fontSize: kFontSizeTiny.px,
								fontWeight: `normal`,
								letterSpacing: `0.1em`,
								lineHeight: 1,
								textTransform: `uppercase`,
								paddingLeft: 0,
							}"
						>
							<div
								class="_header-img"
								:style="{
									width: `20px`,
									height: `20px`,
								}"
							>
								<AppCommunityThumbnailImg :community="i.community" />
							</div>
							{{ i.community.name }}
						</div>
						<AppCommunityPerms :community="i.community" required="community-features">
							<a class="list-group-item has-icon" @click.stop="toggleFeatured(i)">
								<AppJolticon icon="star" />
								<template v-if="i.isFeatured">
									{{
										$gettext(`Unfeature from %{ community }`, {
											community: i.community.name,
										})
									}}
								</template>
								<template v-else>
									{{
										$gettext(`Feature in %{ community }`, {
											community: i.community.name,
										})
									}}
								</template>
							</a>
						</AppCommunityPerms>

						<AppCommunityPerms :community="i.community" required="community-posts">
							<a
								class="list-group-item has-icon"
								@click.stop="movePostFromCommunityChannel(i)"
							>
								<AppJolticon icon="arrow-forward" />
								{{ $gettext(`Move to a different channel`) }}
							</a>

							<a
								class="list-group-item has-icon"
								@click.stop="rejectFromCommunity(i)"
							>
								<AppJolticon icon="eject" />
								{{
									$gettext(`Eject from %{ community }`, {
										community: i.community.name,
									})
								}}
							</a>
						</AppCommunityPerms>

						<AppCommunityPerms
							v-if="shouldShowBlockCommunityUser"
							:community="i.community"
							required="community-blocks"
						>
							<a class="list-group-item has-icon" @click.stop="blockFromCommunity(i)">
								<AppJolticon icon="friend-remove-2" />
								{{
									$gettext(`Block author from %{ community }`, {
										community: i.community.name,
									})
								}}
							</a>
						</AppCommunityPerms>
					</div>
				</template>
			</div>
		</template>
	</AppPopper>
</template>

<style lang="stylus" scoped>
._header
	padding: $list-group-item-padding

._header-img
	margin-left: $list-group-item-padding
	margin-right: $list-group-item-padding
</style>
