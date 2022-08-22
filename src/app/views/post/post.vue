<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { enforceLocation } from '../../../utils/router';
import { Api } from '../../../_common/api/api.service';
import {
	CommentThreadModal,
	CommentThreadModalPermalinkDeregister,
} from '../../../_common/comment/thread/modal.service';
import { CommunityUserNotification } from '../../../_common/community/user-notification/user-notification.model';
import { $viewPost, FiresidePost } from '../../../_common/fireside/post/post-model';
import { Meta } from '../../../_common/meta/meta-service';
import { Registry } from '../../../_common/registry/registry.service';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';
import { useThemeStore } from '../../../_common/theme/theme.store';
import { Translate } from '../../../_common/translate/translate.service';
import { IntentService } from '../../components/intent/intent.service';
import AppPostPagePlaceholder from './_page-placeholder/page-placeholder.vue';
import AppPostPage from './_page/AppPostPage.vue';

const PostThemeKey = 'post';

@Options({
	name: 'RoutePost',
	components: {
		AppPostPage,
		AppPostPagePlaceholder,
	},
})
@OptionsForRoute({
	lazy: true,
	cache: true,
	deps: { params: ['slug'], query: ['intent'] },
	async resolver({ route }) {
		const intentRedirect = IntentService.checkRoute(route, {
			intent: 'like-post',
			message: Translate.$gettext(`You like this post! That's cool.`),
		});
		if (intentRedirect) {
			return intentRedirect;
		}

		const postHash = FiresidePost.pullHashFromUrl(route.params.slug.toString());
		const payload = await Api.sendRequest('/web/posts/view/' + postHash);

		if (payload?.post) {
			const redirect = enforceLocation(route, { slug: payload.post.slug });
			if (redirect) {
				return redirect;
			}
		}

		return payload;
	},
})
export default class RoutePost extends BaseRouteComponent {
	themeStore = setup(() => useThemeStore());

	post: FiresidePost | null = null;
	communityNotifications: CommunityUserNotification[] = [];

	/** @override */
	disableRouteTitleSuffix = true;

	private permalinkWatchDeregister?: CommentThreadModalPermalinkDeregister;

	get theme() {
		if (!this.post) {
			return null;
		}

		return this.post.game?.theme ?? this.post.user.theme ?? null;
	}

	get routeTitle() {
		if (!this.post) {
			return null;
		}

		const lead = this.post.getShortLead();
		const user = this.post.user.display_name;
		const game = this.post.game?.title;

		if (game) {
			return this.$gettextInterpolate(`%{ lead } - %{ game } by %{ user }`, {
				lead,
				game,
				user,
			});
		}

		return this.$gettextInterpolate('%{ user } on Game Jolt: "%{ lead }"', {
			user,
			lead,
		});
	}

	routeCreated() {
		const hash = FiresidePost.pullHashFromUrl(this.$route.params.slug.toString());
		this.post = Registry.find<FiresidePost>('FiresidePost', i => i.hash === hash);
		this.setPageTheme();
	}

	routeResolved($payload: any) {
		const post = new FiresidePost($payload.post);
		if (this.post) {
			this.post.assign(post);
		} else {
			this.post = post;
		}

		if ($payload.communityNotifications) {
			this.communityNotifications = CommunityUserNotification.populate(
				$payload.communityNotifications
			);
		}

		this.setPageTheme();

		CommentThreadModal.showFromPermalink(this.$router, this.post, 'comments');
		this.permalinkWatchDeregister = CommentThreadModal.watchForPermalink(
			this.$router,
			this.post,
			'comments'
		);

		$viewPost(this.post);

		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;
	}

	routeDestroyed() {
		if (this.permalinkWatchDeregister) {
			this.permalinkWatchDeregister();
			this.permalinkWatchDeregister = undefined;
		}

		this.themeStore.clearPageTheme(PostThemeKey);
	}

	private setPageTheme() {
		this.themeStore.setPageTheme({ key: PostThemeKey, theme: this.theme });
	}
}
</script>

<template>
	<AppPostPagePlaceholder v-if="!post" />
	<AppPostPage v-else :post="post" :community-notifications="communityNotifications" />
</template>
