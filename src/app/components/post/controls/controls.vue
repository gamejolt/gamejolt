<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import {
	Analytics,
	PostControlsLocation,
	trackPostPublish,
} from '../../../../_common/analytics/analytics.service';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	CommentStoreModel,
	lockCommentStore,
	releaseCommentStore,
	setCommentCount,
} from '../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../_common/comment/modal/modal.service';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { setDrawerOpen, useDrawerStore } from '../../../../_common/drawer/drawer-store';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import { formatNumber } from '../../../../_common/filters/number';
import AppFiresidePostLikeWidget from '../../../../_common/fireside/post/like/widget/widget.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../_common/screen/screen-service';
import AppStickerControlsOverlay from '../../../../_common/sticker/AppStickerControlsOverlay.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { UserFollowSuggestion } from '../../../../_common/user/follow/suggestion.service';
import { User } from '../../../../_common/user/user.model';
import { ActivityFeedItem } from '../../activity/feed/item-service';
import { ActivityFeedView } from '../../activity/feed/view';
import { AppCommentWidgetLazy } from '../../lazy';
import { PostEditModal } from '../edit-modal/edit-modal-service';
import AppPostControlsStats from './AppPostControlsStats.vue';
import AppPostControlsMore from './more/more.vue';
import AppPostControlsSaveProgress from './save-progress/save-progress.vue';
import AppPostControlsUserFollow from './user-follow/user-follow.vue';

@Options({
	components: {
		AppPostControlsUserFollow,
		AppPostControlsMore,
		AppPostControlsStats,
		AppPostControlsSaveProgress,
		AppStickerControlsOverlay,
		AppCommentWidget: AppCommentWidgetLazy,
		AppFiresidePostLikeWidget,
		AppTheme,
	},
	directives: {
		AppTooltip: vAppTooltip,
		AppAuthRequired: vAppAuthRequired,
	},
})
export default class AppPostControls extends Vue {
	@Prop({ type: Object, required: true })
	post!: FiresidePost;

	@Prop({ type: Object, required: false })
	feed?: ActivityFeedView;

	@Prop({ type: Object, required: false })
	item?: ActivityFeedItem;

	@Prop({ type: String, required: true })
	location!: PostControlsLocation;

	@Prop({ type: Boolean, required: false, default: false })
	shouldShowFollow!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	showComments!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	overlay!: boolean;

	@Prop({ type: String, required: false, default: '' })
	eventLabel!: string;

	commonStore = setup(() => useCommonStore());

	@Inject({ from: CommentStoreManagerKey })
	commentManager!: CommentStoreManager;

	drawerStore = shallowSetup(() => useDrawerStore());

	get user() {
		return this.commonStore.user;
	}

	shouldShowFollowState = false;
	private commentStore: null | CommentStoreModel = null;

	readonly GJ_IS_DESKTOP_APP!: boolean;
	readonly Screen = Screen;
	readonly formatFuzzynumber = formatFuzzynumber;
	readonly formatNumber = formatNumber;

	@Emit('post-edit') emitPostEdit() {}
	@Emit('post-publish') emitPostPublish() {}
	@Emit('post-remove') emitPostRemove() {}
	@Emit('post-feature') emitPostFeature(_community: Community) {}
	@Emit('post-unfeature') emitPostUnfeature(_community: Community) {}
	@Emit('post-move-channel') emitPostMoveChannel(_movedTo: CommunityChannel) {}
	@Emit('post-reject') emitPostReject(_community: Community) {}
	@Emit('post-pin') emitPostPin() {}
	@Emit('post-unpin') emitPostUnpin() {}
	@Emit('sticker') emitSticker() {}

	get hasActivePost() {
		return this.post && this.post.status === FiresidePost.STATUS_ACTIVE;
	}

	get isShowingFollow() {
		if (!this.shouldShowFollow || !this.shouldShowFollowState || !this.post) {
			return false;
		}

		if ((this.user && this.user.id === this.post.user.id) || this.post.user.is_following) {
			return false;
		}

		return true;
	}

	get commentsCount() {
		return this.commentStore ? this.commentStore.totalCount : 0;
	}

	get canPublish() {
		return (
			this.post.isDraft &&
			!this.post.isScheduled &&
			this.post.hasLead &&
			this.post.canPublishToCommunities()
		);
	}

	get showUserControls() {
		return this.post.isActive && !this.post.is_processing;
	}

	get hasPerms() {
		if (!this.user) {
			return false;
		}
		return this.post.isEditableByUser(this.user);
	}

	get shouldShowEdit() {
		return this.hasPerms;
	}

	get shouldShowExtra() {
		return this.user instanceof User;
	}

	get shouldShowCommentsButton() {
		return this.showComments;
	}

	get shouldShowStickersButton() {
		return this.post.canPlaceSticker;
	}

	get shouldShowStatsInNewLine() {
		return Screen.isXs;
	}

	get shouldShowLike() {
		return this.post.canLike;
	}

	created() {
		// The 'feed' and 'item' props will be included when this is used in the
		// activity feed. If that's the case, we need to make sure we synchronize with
		// the activity feed item state so that if they click away from the feed and
		// back to it, it can initialize with the previous state.
		if (this.item && this.feed) {
			this.shouldShowFollowState = this.feed.isItemShowingFollow(this.item);
		}

		this.commentStore = lockCommentStore(this.commentManager, 'Fireside_Post', this.post.id);
		setCommentCount(this.commentStore, this.post.comment_count);
	}

	unmounted() {
		if (this.commentStore) {
			releaseCommentStore(this.commentManager, this.commentStore);
			this.commentStore = null;
		}
	}

	openComments() {
		Analytics.trackEvent('post-controls', 'comments', this.eventLabel);
		CommentModal.show({
			model: this.post,
			displayMode: 'comments',
		});
	}

	async openEdit() {
		Analytics.trackEvent('post-controls', 'edit', this.eventLabel);
		if (await PostEditModal.show(this.post)) {
			this.emitPostEdit();
		}
	}

	async publish() {
		trackPostPublish();
		await this.post.$publish();
		this.emitPostPublish();
	}

	async placeSticker() {
		Analytics.trackEvent('post-controls', 'sticker-place', this.eventLabel);
		setDrawerOpen(this.drawerStore, true);
		this.emitSticker();
	}

	setUserFollow(showing: boolean) {
		if (showing && this.post) {
			// Do nothing if a post is liked and we recently suggested
			// to follow that user - so we don't spam them.
			if (!UserFollowSuggestion.canSuggest(this.post.user.id)) {
				return;
			}

			// Track analytics for how many people see user-follow,
			// and stop suggesting to follow the user for 'X' amount
			// of time - specified in UserFollowSuggestion.
			Analytics.trackEvent('user-follow', 'show', 'fireside-post-like-widget');
			UserFollowSuggestion.doNotSuggest(this.post.user.id);
		}

		this.shouldShowFollowState = showing;

		// If we're part of the activity feed, synchronize it with that state as well.
		if (this.item && this.feed) {
			this.feed.setItemShowingFollow(this.item, showing);
		}
	}

	onUserFollowDismissal() {
		// Track analytics for how often people click
		// on the 'X' button to hide user-follow.
		Analytics.trackEvent('user-follow', 'hide', 'fireside-post-like-widget');
		this.setUserFollow(false);
	}
}
</script>

<template>
	<div>
		<AppTheme :force-dark="overlay">
			<AppStickerControlsOverlay end :hide="overlay">
				<div class="post-controls">
					<div class="-row">
						<div v-if="showUserControls" class="-row">
							<AppFiresidePostLikeWidget
								v-if="shouldShowLike"
								:post="post"
								:location="location"
								:overlay="overlay"
								trans
								@change="setUserFollow"
							/>

							<div
								v-if="shouldShowCommentsButton"
								class="-inline-button"
								:class="{ '-overlay-text': overlay }"
							>
								<AppButton
									v-app-tooltip="$gettext('View Comments')"
									icon="comment-filled"
									circle
									trans
									@click="openComments()"
								/>

								<a
									v-if="commentsCount > 0"
									class="blip"
									:class="{ mobile: Screen.isXs }"
									@click="openComments()"
								>
									{{ formatFuzzynumber(commentsCount) }}
								</a>
								<span v-else class="blip-missing" />
							</div>

							<AppButton
								v-if="shouldShowStickersButton"
								v-app-tooltip="$gettext('Place Sticker')"
								v-app-auth-required
								:class="{ '-overlay-text': overlay }"
								icon="sticker-filled"
								circle
								trans
								@click="placeSticker()"
							/>
						</div>
						<div v-else-if="post.is_processing" class="-row fill-offset -processing">
							<AppPostControlsSaveProgress :post="post" />
						</div>
						<span v-if="shouldShowExtra" class="-extra">
							<span v-if="shouldShowEdit && !showUserControls" class="-extra">
								<AppButton
									v-if="canPublish"
									class="-inline-button"
									:overlay="overlay"
									primary
									@click="publish()"
								>
									<AppTranslate>Publish</AppTranslate>
								</AppButton>
								<AppButton
									class="-inline-button"
									:overlay="overlay"
									@click="openEdit()"
								>
									<AppTranslate>Edit</AppTranslate>
								</AppButton>

								<span class="-spacing-right" />
							</span>

							<AppPostControlsMore
								:post="post"
								:overlay="overlay"
								@remove="emitPostRemove"
								@feature="emitPostFeature"
								@unfeature="emitPostUnfeature"
								@move-channel="emitPostMoveChannel"
								@reject="emitPostReject"
								@pin="emitPostPin"
								@unpin="emitPostUnpin"
							/>
						</span>
					</div>

					<div
						class="-row small"
						:class="{ '-spacing-top': shouldShowEdit, tiny: Screen.isXs }"
					>
						<AppPostControlsStats
							:key="'stats'"
							:class="{ 'text-muted': !overlay }"
							:overlay="overlay"
							:post="post"
						/>

						<span v-if="shouldShowEdit && showUserControls" class="-extra">
							<AppButton
								v-if="canPublish"
								class="-inline-button"
								:overlay="overlay"
								primary
								@click="publish()"
							>
								<AppTranslate>Publish</AppTranslate>
							</AppButton>
							<AppButton
								class="-inline-button"
								:overlay="overlay"
								@click="openEdit()"
							>
								<AppTranslate>Edit</AppTranslate>
							</AppButton>
						</span>
					</div>
				</div>
			</AppStickerControlsOverlay>
		</AppTheme>

		<AppPostControlsUserFollow
			:class="{ '-overlay-box': overlay }"
			:post="post"
			:should-show="isShowingFollow"
			@close="onUserFollowDismissal"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.post-controls
	display: flex
	flex-direction: column
	flex-grow: 1

	.-row
		display: flex
		align-items: center

	.-processing
		padding: 8px
		rounded-corners()

	.-inline-button
		display: inline-flex
		align-items: center

	.-extra
		margin-left: auto
		flex-shrink: 0

		.-inline-button
			margin-left: 12px

	.-spacing
		&-top
			margin-top: 12px

		&-right
			margin-right: 8px

.-overlay-text
	::v-deep(*)
		color: white
		text-shadow: black 1px 1px 4px

.-overlay-box
	elevate-1()
</style>
