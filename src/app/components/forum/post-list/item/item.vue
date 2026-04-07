<script lang="ts">
import { nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { Clipboard } from '../../../../../_common/clipboard/clipboard-service';
import AppContentViewer from '../../../../../_common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { formatDate } from '../../../../../_common/filters/date';
import { formatNumber } from '../../../../../_common/filters/number';
import { ForumPostModel } from '../../../../../_common/forum/post/post.model';
import { ForumTopicModel } from '../../../../../_common/forum/topic/topic.model';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import AppMessageThread from '../../../../../_common/message-thread/AppMessageThread.vue';
import AppMessageThreadAdd from '../../../../../_common/message-thread/AppMessageThreadAdd.vue';
import AppMessageThreadItem from '../../../../../_common/message-thread/AppMessageThreadItem.vue';
import { $readNotification } from '../../../../../_common/notification/notification-model';
import AppPopper from '../../../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../../../_common/popper/popper.service';
import { showReportModal } from '../../../../../_common/report/modal/modal.service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import FormForumPost from '../../../forms/forum/post/FormForumPost.vue';

const InviewConfig = new ScrollInviewConfig();

@Options({
	components: {
		AppScrollInview,
		AppMessageThread,
		AppMessageThreadItem,
		AppMessageThreadAdd,
		AppExpand,
		FormForumPost,
		AppPopper,
		AppContentViewer,

		// Since it's recursive it needs to be able to resolve itself.
		AppForumPostListItem: () => Promise.resolve(AppForumPostListItem),
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppForumPostListItem extends Vue {
	@Prop(Object) topic!: ForumTopicModel;
	@Prop(Object) post!: ForumPostModel;
	@Prop(Boolean) isReply!: boolean;
	@Prop(Boolean) showReplies!: boolean;
	@Prop(Boolean) isLastInThread?: boolean;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	isEditing = false;
	isShowingReplies = false;

	showingParent = false;
	parent: ForumPostModel | null = null;
	replies: ForumPostModel[] = [];
	totalReplyCount = 0;

	readonly InviewConfig = InviewConfig;
	readonly formatDate = formatDate;
	readonly formatNumber = formatNumber;
	readonly Environment = Environment;

	get id() {
		return (this.isReply ? this.post.parent_post_id + '-' : '') + this.post.id;
	}

	get isActive() {
		// We never mark ourselves as active if we're showing as a reply.
		return !this.parent && this.$route.hash === '#forum-post-' + this.id;
	}

	@Watch('isActive', { immediate: true })
	async onActiveChanged(isActive: boolean) {
		// Wait till we're compiled into the DOM.
		await nextTick();
		if (isActive) {
			Scroll.to(this.$el as HTMLElement);
		}
	}

	toggleReplies() {
		if (this.isShowingReplies) {
			this.isShowingReplies = false;
			return;
		}

		this.loadReplies();
	}

	async loadReplies() {
		try {
			const payload = await Api.sendRequest(
				'/web/forums/posts/replies/' + this.post.id,
				undefined,
				{ noErrorRedirect: true }
			);

			this.replies = ForumPostModel.populate(payload.replies);
			this.totalReplyCount = payload.repliesCount || 0;

			if (!this.isShowingReplies) {
				this.isShowingReplies = true;
			}
		} catch (e) {
			showErrorGrowl(
				this.$gettext(`Couldn't load replies for some reason.`),
				this.$gettext(`Loading Failed`)
			);
		}
	}

	async loadParentPost() {
		if (this.showingParent) {
			this.showingParent = false;
			return;
		}

		// Don't load it in more than once.
		if (this.parent) {
			this.showingParent = true;
		}

		try {
			const payload = await Api.sendRequest(
				'/web/forums/posts/parent/' + this.post.id,
				undefined,
				{
					noErrorRedirect: true,
				}
			);
			this.parent = new ForumPostModel(payload.parent);
			this.showingParent = true;
		} catch (e) {
			// The post was probably removed.
			this.parent = null;
			this.showingParent = true;
		}
	}

	edit() {
		this.isEditing = true;
		Popper.hideAll();
	}

	closeEdit() {
		this.isEditing = false;
	}

	report() {
		showReportModal(this.post);
	}

	onInviewChange(isInView: boolean) {
		if (isInView && this.post.notification) {
			// Don't wait for success before updating the view.
			$readNotification(this.post.notification);
			this.post.notification = undefined;
		}
	}

	copyPermalink() {
		Clipboard.copy(this.post.getPermalink());
	}
}
</script>

<template>
	<AppMessageThreadItem
		:id="`forum-post-${id}`"
		:user="post.user"
		:replied-to="isReply ? post.replied_to : undefined"
		:date="post.posted_on"
		:is-active="isActive"
		:is-new="!!post.notification"
		:is-showing-replies="isShowingReplies"
		:is-reply="isReply"
		:is-last="isLastInThread"
	>
		<AppScrollInview
			:config="InviewConfig"
			@inview="onInviewChange(true)"
			@outview="onInviewChange(false)"
		>
			<a
				v-if="!isReply && post.parent_post_id && post.replied_to"
				class="forum-post-replied-to-button"
				@click="loadParentPost"
			>
				<AppJolticon
					class="middle"
					:icon="'chevron-' + (!showingParent ? 'right' : 'down')"
				/>
				<span v-translate="{ user: post.replied_to.display_name }">
					In response to
					<b>%{ user }</b>
				</span>
				<small>@{{ post.replied_to.username }}</small>
			</a>

			<AppExpand :when="showingParent">
				<div v-if="parent" class="forum-post-content-quoted">
					<AppContentViewer :source="parent.text_content" />
				</div>
				<p v-else>
					<strong><AppTranslate>Post removed.</AppTranslate></strong>
				</p>
				<hr />
			</AppExpand>

			<AppContentViewer v-if="!isEditing" :source="post.text_content" />
			<template v-else>
				<FormForumPost
					:model="post"
					:topic="topic"
					@cancel="closeEdit"
					@submit="closeEdit"
				/>

				<br />
			</template>

			<p v-if="post.modified_by_user && post.modified_on" class="text-muted small">
				<AppTranslate>Last modified on</AppTranslate>
				{{ ' ' }}
				<span :title="formatDate(post.modified_on, 'medium')">
					{{ formatDate(post.modified_on, 'longDate') }}
				</span>
				{{ ' ' }}
				<AppTranslate>by</AppTranslate>
				{{ ' ' }}
				<router-link
					class="link-unstyled"
					:to="{
						name: 'profile.overview',
						params: { username: post.modified_by_user.username },
					}"
				>
					<strong>
						{{ post.modified_by_user.display_name }}
					</strong>
				</router-link>
				{{ ' ' }}
				<small>@{{ post.modified_by_user.username }}</small>
			</p>
		</AppScrollInview>

		<template #meta>
			<AppPopper v-if="app.user" popover-class="fill-darkest">
				<a v-app-tooltip="$gettext('Options')" class="link-muted">
					<AppJolticon icon="ellipsis-v" class="middle" />
				</a>

				<template #popover>
					<div class="list-group list-group-dark">
						<a class="list-group-item has-icon" @click="copyPermalink">
							<AppJolticon icon="link" />
							<AppTranslate>Copy Link</AppTranslate>
						</a>

						<a
							v-if="
								app.user &&
								post.user_id === app.user.id &&
								!topic.is_locked &&
								!isEditing
							"
							class="list-group-item has-icon"
							@click="edit()"
						>
							<AppJolticon icon="edit" />
							<AppTranslate>Edit Post</AppTranslate>
						</a>
						<a class="list-group-item has-icon" @click="report">
							<AppJolticon icon="flag" notice />
							<AppTranslate>Report Post</AppTranslate>
						</a>
						<template v-if="app.user.permission_level > 0">
							<a
								class="list-group-item"
								:href="
									Environment.baseUrl + `/moderate/forums/posts/remove/${post.id}`
								"
								target="_blank"
							>
								<AppTranslate>Remove (Mod)</AppTranslate>
							</a>
							<a
								class="list-group-item"
								:href="Environment.baseUrl + `/moderate/users/view/${post.user_id}`"
								target="_blank"
							>
								<AppTranslate>Moderate User</AppTranslate>
							</a>
						</template>
					</div>
				</template>
			</AppPopper>
		</template>

		<template v-if="!isReply" #controls>
			<AppButton
				v-if="post.replies_count && !isEditing"
				type="a"
				trans
				@click="toggleReplies"
			>
				<AppTranslate
					:translate-n="post.replies_count"
					:translate-params="{ count: post.replies_count }"
					translate-plural="+ %{ count } replies"
				>
					+ %{ count } reply
				</AppTranslate>
			</AppButton>
		</template>

		<template v-if="isShowingReplies" #replies>
			<AppMessageThread v-if="isShowingReplies && replies.length > 0">
				<AppForumPostListItem
					v-for="(reply, i) of replies"
					:key="reply.id"
					:topic="topic"
					:post="reply"
					:is-reply="true"
					:is-last-in-thread="i === replies.length - 1"
				/>
			</AppMessageThread>

			<template v-if="totalReplyCount - replies.length > 0">
				<br />
				<p>
					<AppTranslate
						:translate-n="totalReplyCount - replies.length"
						:translate-params="{
							count: formatNumber(totalReplyCount - replies.length),
						}"
						translate-plural="+%{ count } more hidden"
					>
						+%{ count } more hidden
					</AppTranslate>
				</p>
			</template>
		</template>
	</AppMessageThreadItem>
</template>

<style lang="stylus" scoped>
.forum-post
	&-replied-to-button
		rounded-corners()
		change-bg('bg-offset')
		theme-prop('color', 'fg')
		display: block
		margin-bottom: $line-height-computed
		padding: 5px 10px
		font-size: $font-size-small
</style>
