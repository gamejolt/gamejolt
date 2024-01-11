<script lang="ts" setup>
import { PropType, computed, toRef, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
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
import { PurchasableProductType } from '../../../../../_common/inventory/shop/product-owner-helpers';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppPopper from '../../../../../_common/popper/AppPopper.vue';
import { showReportModal } from '../../../../../_common/report/modal/modal.service';
import { copyShareLink } from '../../../../../_common/share/share.service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { UserModel } from '../../../../../_common/user/user.model';
import { styleWhen } from '../../../../../_styles/mixins';
import { kFontSizeTiny } from '../../../../../_styles/variables';
import { arrayRemove } from '../../../../../utils/array';
import { showCommunityBlockUserModal } from '../../../community/block-user-modal/block-user-modal.service';
import { showCommunityEjectPostModal } from '../../../community/eject-post/modal/modal.service';
import { showCommunityMovePostModal } from '../../../community/move-post/modal/modal.service';
import AppCommunityPerms from '../../../community/perms/AppCommunityPerms.vue';
import { useGridStore } from '../../../grid/grid-store';
import { showPurchaseShopProductModal } from '../../../vending-machine/modal/_purchase-modal/modal.service';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePostModel>,
		required: true,
	},

	overlay: {
		type: Boolean,
	},
});

const { post, overlay } = toRefs(props);

const route = useRoute();

const { user: sessionUser } = useCommonStore();
const { grid } = useGridStore();

const emit = defineEmits({
	remove: () => true,
	feature: (_community: CommunityModel) => true,
	unfeature: (_community: CommunityModel) => true,
	'move-channel': (_movedTo: CommunityChannelModel) => true,
	reject: (_community: CommunityModel) => true,
	pin: () => true,
	unpin: () => true,
});

const canEdit = toRef(() => post.value.isEditableByUser(sessionUser.value));
const shouldShowManageCommunities = toRef(
	() =>
		post.value.status === FiresidePostStatus.Active &&
		post.value.manageableCommunities.length !== 0
);
const shouldShowModTools = toRef(() => sessionUser.value && sessionUser.value.isMod);
const siteModerateLink = toRef(
	() => Environment.baseUrl + `/moderate/fireside-posts/view/${post.value.id}`
);
const avatarFrame = toRef(() => post.value.displayUser.avatar_frame);
const shouldShowBlockCommunityUser = toRef(() => {
	// Cannot block yourself.
	return post.value.user.id !== sessionUser.value?.id;
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

	if (post.value.status !== FiresidePostStatus.Active) {
		return false;
	}

	const pinContext = post.value.getPinContextFor(route);
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
		await $unfeatureFiresidePost(post.value, postCommunity.community);
		emit('unfeature', postCommunity.community);
	} else {
		await $featureFiresidePost(post.value, postCommunity.community);
		grid.value?.recordFeaturedPost(post.value);
		emit('feature', postCommunity.community);
	}
}

async function movePostFromCommunityChannel(postCommunity: FiresidePostCommunityModel) {
	let possibleChannels = postCommunity.community.channels;
	if (!possibleChannels) {
		possibleChannels = await fetchCommunityChannels(postCommunity.community);
	}

	const result = await showCommunityMovePostModal(postCommunity, post.value, possibleChannels);
	if (!result) {
		return;
	}

	try {
		await $moveFiresidePostToChannel(
			post.value,
			postCommunity.community,
			result.channel,
			result
		);
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
	const result = await showCommunityEjectPostModal(postCommunity, post.value);
	if (!result) {
		return;
	}

	try {
		await $rejectFiresidePost(post.value, postCommunity.community, result);
		// Make sure the post community gets removed from the post.
		// The backend might not return the post resource if the post was already
		// ejected, so the community list doesn't get updated.
		arrayRemove(post.value.communities, i => i.id === postCommunity.id);
		emit('reject', postCommunity.community);
	} catch (err) {
		console.warn('Failed to eject post');
		return;
	}
}

function blockFromCommunity(postCommunity: FiresidePostCommunityModel) {
	showCommunityBlockUserModal(post.value.user, postCommunity.community);
}

function copyShareUrl() {
	copyShareLink(post.value.url, 'post');
}

function report() {
	showReportModal(post.value);
}

async function remove() {
	if (await $removeFiresidePost(post.value)) {
		emit('remove');
	}
}

function _getPinTarget() {
	const pinContext = post.value.getPinContextFor(route);

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
	const wasPinned = post.value.is_pinned;

	const { resourceName, resourceId } = _getPinTarget();
	await $togglePinOnFiresidePost(post.value, resourceName, resourceId);
	post.value.is_pinned = !wasPinned;

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
				<a
					v-app-track-event="`copy-link:post`"
					class="list-group-item has-icon"
					@click="copyShareUrl"
				>
					<AppJolticon icon="link" />
					{{ $gettext(`Copy link to post`) }}
				</a>

				<template v-if="avatarFrame">
					<!-- TODO(resource-collectible-links) Open a modal to view
					details first. Should include a button to open the purchase
					modal if it has a purchasable acquisition method. -->
					<a
						class="list-group-item has-icon"
						@click="
							showPurchaseShopProductModal({
								resource: PurchasableProductType.AvatarFrame,
								resourceId: avatarFrame.id,
							})
						"
					>
						<AppJolticon icon="subscribe" />
						{{ $gettext(`View avatar frame`) }}
					</a>
				</template>

				<template v-if="post.background">
					<!-- TODO(resource-collectible-links)  -->
					<a
						class="list-group-item has-icon"
						@click="
							showPurchaseShopProductModal({
								resource: PurchasableProductType.Background,
								resourceId: post.background.id,
							})
						"
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
