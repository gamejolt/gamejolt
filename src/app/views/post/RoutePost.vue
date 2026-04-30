<script lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import {
	CommentThreadModalPermalinkDeregister,
	showCommentThreadModalFromPermalink,
	watchForCommentThreadModalPermalink,
} from '~app/components/comment/thread/modal.service';
import { IntentService } from '~app/components/intent/intent.service';
import AppPostPage from '~app/views/post/_page/AppPostPage.vue';
import AppPostPagePlaceholder from '~app/views/post/_page-placeholder/AppPostPagePlaceholder.vue';
import { Api } from '~common/api/api.service';
import { CommunityUserNotificationModel } from '~common/community/user-notification/user-notification.model';
import { pullFiresidePostHashFromUrl } from '~common/fireside/post/post-model';
import { $viewPost, FiresidePostModel } from '~common/fireside/post/post-model';
import { Meta } from '~common/meta/meta-service';
import { findInRegistry } from '~common/registry/registry.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { useThemeStore } from '~common/theme/theme.store';
import { $gettext } from '~common/translate/translate.service';
import { enforceLocation } from '~utils/router';

export default {
	name: 'RoutePost',
	...defineAppRouteOptions({
		lazy: true,
		cache: true,
		reloadOn: { params: ['slug'], query: ['intent'] },
		async resolver({ route }) {
			const intentRedirect = IntentService.checkRoute(route, {
				intent: 'like-post',
				message: $gettext(`You like this post! That's cool.`),
			});
			if (intentRedirect) {
				return intentRedirect;
			}

			const postHash = pullFiresidePostHashFromUrl(route.params.slug.toString());
			const payload = await Api.sendRequest('/web/posts/view/' + postHash);

			if (payload?.post) {
				const redirect = enforceLocation(route, { slug: payload.post.slug });
				if (redirect) {
					return redirect;
				}
			}

			return payload;
		},
	}),
};
</script>

<script lang="ts" setup>
const PostThemeKey = 'post';

const route = useRoute();
const themeStore = useThemeStore();

const post = ref<FiresidePostModel | null>(null);
const communityNotifications = ref<CommunityUserNotificationModel[]>([]);

let permalinkWatchDeregister: CommentThreadModalPermalinkDeregister | undefined;

const theme = computed(() => {
	if (!post.value) {
		return null;
	}

	return post.value.game?.theme ?? post.value.user.theme ?? null;
});

function setPageTheme() {
	themeStore.setPageTheme({ key: PostThemeKey, theme: theme.value });
}

createAppRoute({
	disableTitleSuffix: true,
	routeTitle: computed(() => {
		if (!post.value) {
			return null;
		}

		const lead = post.value.getShortLead();
		const user = post.value.user.display_name;
		const game = post.value.game?.title;

		if (game) {
			return $gettext(`%{ lead } - %{ game } by %{ user }`, {
				lead,
				game,
				user,
			});
		}

		return $gettext('%{ user } on Game Jolt: "%{ lead }"', {
			user,
			lead,
		});
	}),
	onInit() {
		const hash = pullFiresidePostHashFromUrl(route.params.slug.toString());
		post.value = findInRegistry<FiresidePostModel>('FiresidePost', i => i.hash === hash);
		setPageTheme();
	},
	onResolved({ payload }) {
		const newPost = new FiresidePostModel(payload.post);
		if (post.value) {
			post.value.assign(newPost);
		} else {
			post.value = newPost;
		}

		if (payload.communityNotifications) {
			communityNotifications.value = CommunityUserNotificationModel.populate(
				payload.communityNotifications
			);
		}

		setPageTheme();

		showCommentThreadModalFromPermalink(post.value, 'comments');
		permalinkWatchDeregister = watchForCommentThreadModalPermalink(post.value, 'comments');

		$viewPost(post.value);

		Meta.description = payload.metaDescription;
		Meta.fb = payload.fb;
		Meta.twitter = payload.twitter;
	},
	onDestroyed() {
		if (permalinkWatchDeregister) {
			permalinkWatchDeregister();
			permalinkWatchDeregister = undefined;
		}

		themeStore.clearPageTheme(PostThemeKey);
	},
});
</script>

<template>
	<AppPostPagePlaceholder v-if="!post" />
	<AppPostPage v-else :post="post" :community-notifications="communityNotifications" />
</template>
