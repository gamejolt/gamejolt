import { Component } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import {
	CommentThreadModal,
	CommentThreadModalPermalinkDeregister,
} from '../../../_common/comment/thread/modal.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { Meta } from '../../../_common/meta/meta-service';
import { Registry } from '../../../_common/registry/registry.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { Translate } from '../../../_common/translate/translate.service';
import { IntentService } from '../../components/intent/intent.service';
import { store } from '../../store';
import AppPostPagePlaceholder from './_page-placeholder/page-placeholder.vue';
import AppPostPage from './_page/page.vue';

const PostThemeKey = 'post';

@Component({
	name: 'RoutePost',
	components: {
		AppPostPage,
		AppPostPagePlaceholder,
	},
})
@RouteResolver({
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

		const postHash = FiresidePost.pullHashFromUrl(route.params.slug);
		return Api.sendRequest('/web/posts/view/' + postHash);
	},
})
export default class RoutePost extends BaseRouteComponent {
	post: FiresidePost | null = null;

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

		this.disableRouteTitleSuffix = true;

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
		const hash = FiresidePost.pullHashFromUrl(this.$route.params.slug);
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

		this.setPageTheme();

		CommentThreadModal.showFromPermalink(this.$router, this.post, 'comments');
		this.permalinkWatchDeregister = CommentThreadModal.watchForPermalink(
			this.$router,
			this.post,
			'comments'
		);

		this.post.$viewed();
		this.post.$expanded();

		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;
	}

	routeDestroyed() {
		if (this.permalinkWatchDeregister) {
			this.permalinkWatchDeregister();
			this.permalinkWatchDeregister = undefined;
		}

		store.commit('theme/clearPageTheme', PostThemeKey);
	}

	private setPageTheme() {
		const theme = this.post ? this.post.game?.theme ?? this.post.user.theme : null;
		store.commit('theme/setPageTheme', { key: PostThemeKey, theme });
	}
}
