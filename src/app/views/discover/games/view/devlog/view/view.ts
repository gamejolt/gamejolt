import { Component } from 'vue-property-decorator';
import { CreateElement } from 'vue/types/vue';
import { enforceLocation, LocationRedirect } from '../../../../../../../utils/router';
import { Ads } from '../../../../../../../_common/ad/ads.service';
import { Api } from '../../../../../../../_common/api/api.service';
import { CommentThreadModal } from '../../../../../../../_common/comment/thread/modal.service';
import { FiresidePost } from '../../../../../../../_common/fireside/post/post-model';
import { Meta } from '../../../../../../../_common/meta/meta-service';
import { Registry } from '../../../../../../../_common/registry/registry.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { Translate } from '../../../../../../../_common/translate/translate.service';
import { IntentService } from '../../../../../../components/intent/intent.service';
import AppPostView from '../../../../../../components/post/view/view.vue';
import { RouteStore, RouteStoreModule } from '../../view.store';

@Component({
	name: 'RouteDiscoverGamesViewDevlogView',
	components: {
		AppPostView,
	},
})
@RouteResolver({
	lazy: true,
	cache: true,
	deps: { params: ['postSlug'], query: ['intent'] },
	async resolver({ route }) {
		const intentRedirect = IntentService.checkRoute(route, {
			intent: 'like-post',
			message: Translate.$gettext(`You like this post! That's cool.`),
		});
		if (intentRedirect) {
			return intentRedirect;
		}

		const postHash = FiresidePost.pullHashFromUrl(route.params.postSlug);
		const payload = await Api.sendRequest('/web/posts/view/' + postHash);

		if (payload && payload.post) {
			if (payload.post.game) {
				const redirect = enforceLocation(route, {
					postSlug: payload.post.slug,
					slug: payload.post.game.slug,
					id: payload.post.game.id + '',
				});
				if (redirect) {
					return redirect;
				}
			} else {
				// This is not a game devlog, redirect to the user post view
				const redirect = new LocationRedirect({
					name: 'profile.post.view',
					params: { username: payload.post.user.username, slug: payload.post.slug },
					query: route.query,
					hash: route.hash,
					replace: true,
				});
				return redirect;
			}
		}

		return payload;
	},
})
export default class RouteDiscoverGamesViewDevlogView extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	post: FiresidePost | null = null;
	private adDisabler: unknown | null = null;

	get routeTitle() {
		if (!this.post || !this.game) {
			return null;
		}

		return this.$gettextInterpolate(
			`${this.post.lead_snippet} - ${this.game.title} by %{ user }`,
			{
				user: this.post.user.display_name,
			}
		);
	}

	routeCreated() {
		const hash = FiresidePost.pullHashFromUrl(this.$route.params.postSlug);
		this.post = Registry.find<FiresidePost>('FiresidePost', i => i.hash === hash);
	}

	routeResolved($payload: any) {
		const post = new FiresidePost($payload.post);
		if (this.post) {
			this.post.assign(post);
		} else {
			this.post = post;
		}

		CommentThreadModal.showFromPermalink(
			this.$router,
			'Fireside_Post',
			this.post.id,
			'comments'
		);

		this.post.$viewed();
		this.post.$expanded();

		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;

		// The page settings for ads will be set by the game.
		// Even if the game is not ad disabled, we need to be able to disable
		// ads on a post by post basis.
		Ads.deregisterDisabler(this.adDisabler);
		this.adDisabler = $payload.adsDisabled ? Ads.registerDisabler(this.post) : null;
	}

	routeDestroyed() {
		Ads.deregisterDisabler(this.adDisabler);
		this.adDisabler = null;
	}

	render(h: CreateElement) {
		return h(AppPostView, {
			props: {
				post: this.post,
			},
		});
	}
}
