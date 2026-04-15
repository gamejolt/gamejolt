<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { Clipboard } from '../../../../../_common/clipboard/clipboard-service';
import AppContentViewer from '../../../../../_common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { formatDate } from '../../../../../_common/filters/date';
import { formatNumber } from '../../../../../_common/filters/number';
import { ForumPostModel } from '../../../../../_common/forum/post/post.model';
import { ForumTopicModel } from '../../../../../_common/forum/topic/topic.model';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppMessageThread from '../../../../../_common/message-thread/AppMessageThread.vue';
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
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import FormForumPost from '../../../forms/forum/post/FormForumPost.vue';

const InviewConfig = new ScrollInviewConfig();

type Props = {
	topic: ForumTopicModel;
	post: ForumPostModel;
	isReply?: boolean;
	showReplies?: boolean;
	isLastInThread?: boolean;
	userPostCount?: number;
};

const { topic, post, isReply, isLastInThread } = defineProps<Props>();

const { user: appUser } = useCommonStore();
const route = useRoute();

const isEditing = ref(false);
const isShowingReplies = ref(false);
const showingParent = ref(false);
const parent = ref<ForumPostModel | null>(null);
const replies = ref<ForumPostModel[]>([]);
const totalReplyCount = ref(0);

const id = computed(() => {
	return (isReply ? post.parent_post_id + '-' : '') + post.id;
});

const isActive = computed(() => {
	return !parent.value && route.hash === '#forum-post-' + id.value;
});

watch(
	isActive,
	async val => {
		await nextTick();
		if (val) {
			Scroll.to(document.getElementById(`forum-post-${id.value}`) as HTMLElement);
		}
	},
	{ immediate: true }
);

function toggleReplies() {
	if (isShowingReplies.value) {
		isShowingReplies.value = false;
		return;
	}

	loadReplies();
}

async function loadReplies() {
	try {
		const payload = await Api.sendRequest('/web/forums/posts/replies/' + post.id, undefined, {
			noErrorRedirect: true,
		});

		replies.value = ForumPostModel.populate(payload.replies);
		totalReplyCount.value = payload.repliesCount || 0;

		if (!isShowingReplies.value) {
			isShowingReplies.value = true;
		}
	} catch (e) {
		showErrorGrowl(
			$gettext(`Couldn't load replies for some reason.`),
			$gettext(`Loading Failed`)
		);
	}
}

async function loadParentPost() {
	if (showingParent.value) {
		showingParent.value = false;
		return;
	}

	if (parent.value) {
		showingParent.value = true;
	}

	try {
		const payload = await Api.sendRequest('/web/forums/posts/parent/' + post.id, undefined, {
			noErrorRedirect: true,
		});
		parent.value = new ForumPostModel(payload.parent);
		showingParent.value = true;
	} catch (e) {
		parent.value = null;
		showingParent.value = true;
	}
}

function edit() {
	isEditing.value = true;
	Popper.hideAll();
}

function closeEdit() {
	isEditing.value = false;
}

function report() {
	showReportModal(post);
}

function onInviewChange(isInView: boolean) {
	if (isInView && post.notification) {
		$readNotification(post.notification);
		// eslint-disable-next-line vue/no-mutating-props
		post.notification = undefined;
	}
}

function copyPermalink() {
	Clipboard.copy(post.getPermalink());
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
					:icon="('chevron-' + (!showingParent ? 'right' : 'down') as any)"
				/>
				<AppTranslate :translate-params="{ user: post.replied_to.display_name }">
					In response to %{ user }
				</AppTranslate>
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
			<AppPopper v-if="appUser" popover-class="fill-darkest">
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
								appUser &&
								post.user_id === appUser.id &&
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
						<template v-if="appUser.permission_level > 0">
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
			<AppButton v-if="post.replies_count && !isEditing" tag="a" trans @click="toggleReplies">
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
