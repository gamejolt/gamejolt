import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { CommentModal } from 'game-jolt-frontend-lib/components/comment/modal/modal.service';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import { Registry } from 'game-jolt-frontend-lib/components/registry/registry.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { enforceLocation } from 'game-jolt-frontend-lib/utils/router';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { CreateElement } from 'vue/types/vue';
import { IntentService } from '../../../../../../components/intent/intent.service';
import { AppPostView } from '../../../../../../components/post/view/view';
import { RouteState, RouteStore } from '../../view.store';

@Component({
	name: 'RouteDiscoverGamesViewDevlogView',
	components: {
		AppPostView,
	},
})
export default class RouteDiscoverGamesViewDevlogView extends BaseRouteComponent {
	@Prop()
	postSlug!: string;

	@RouteState
	game!: RouteStore['game'];

	post: FiresidePost | null = null;

	@RouteResolve({
		lazy: true,
		cache: true,
		deps: { params: ['postSlug'], query: ['intent'] },
	})
	async routeResolve(this: undefined, route: Route) {
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
			const redirect = enforceLocation(route, { postSlug: payload.post.slug });
			if (redirect) {
				return redirect;
			}
		}

		return payload;
	}

	get routeTitle() {
		return this.post && this.post.lead_snippet;
	}

	routeInit() {
		CommentModal.checkPermalink(this.$router);

		const hash = FiresidePost.pullHashFromUrl(this.postSlug);
		this.post = Registry.find<FiresidePost>('FiresidePost', i => i.hash === hash);
	}

	routed($payload: any) {
		const post = new FiresidePost($payload.post);
		if (this.post) {
			this.post.assign(post);
		} else {
			this.post = post;
		}

		this.post.$viewed();
		this.post.$expanded();

		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;
	}

	render(h: CreateElement) {
		return h(AppPostView, {
			props: {
				post: this.post,
			},
		});
	}
}
