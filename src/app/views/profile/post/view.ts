import { Component } from 'vue-property-decorator';
import { CreateElement } from 'vue/types/vue';
import { enforceLocation, LocationRedirect } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import { CommentThreadModal } from '../../../../_common/comment/thread/modal.service';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Meta } from '../../../../_common/meta/meta-service';
import { Registry } from '../../../../_common/registry/registry.service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Translate } from '../../../../_common/translate/translate.service';
import { IntentService } from '../../../components/intent/intent.service';
import AppPostView from '../../../components/post/view/view.vue';
import { RouteStore, RouteStoreModule } from '../profile.store';

@Component({
	name: 'RouteProfilePostView',
	components: {
		AppPostView,
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
		const payload = await Api.sendRequest('/web/posts/view/' + postHash);

		if (payload && payload.post) {
			if (payload.post.game) {
				// This is a game devlog, not a user post. Redirect to game view.
				const redirect = new LocationRedirect({
					name: 'discover.games.view.devlog.view',
					params: {
						id: payload.post.game.id + '',
						slug: payload.post.game.slug,
						postSlug: payload.post.slug,
					},
					query: route.query,
					hash: route.hash,
					replace: true,
				});
				return redirect;
			} else {
				const redirect = enforceLocation(route, {
					username: payload.post.user.username,
					slug: payload.post.slug,
				});
				if (redirect) {
					return redirect;
				}
			}
		}

		return payload;
	},
})
export default class RouteProfilePostView extends BaseRouteComponent {
	@RouteStoreModule.State
	user!: RouteStore['user'];

	post: FiresidePost | null = null;

	permalinkWatcher?: Function;

	get routeTitle() {
		if (!this.post) {
			return null;
		}

		this.disableRouteTitleSuffix = true;

		return this.$gettextInterpolate('%{ user } on Game Jolt: "%{ post }"', {
			user: this.post.user.display_name,
			post: this.post.getShortLead(),
		});
	}

	routeCreated() {
		const hash = FiresidePost.pullHashFromUrl(this.$route.params.slug);
		this.post = Registry.find<FiresidePost>('FiresidePost', i => i.hash === hash);
	}

	routeResolved($payload: any) {
		const post = new FiresidePost($payload.post);
		if (this.post) {
			this.post.assign(post);
		} else {
			this.post = post;
		}

		CommentThreadModal.showFromPermalink(this.$router, this.post, 'comments');
		this.permalinkWatcher = CommentThreadModal.watchForPermalink(
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

	destroyed() {
		if (this.permalinkWatcher) {
			this.permalinkWatcher = undefined;
		}
	}

	render(h: CreateElement) {
		return h(AppPostView, {
			props: {
				post: this.post,
			},
		});
	}
}
