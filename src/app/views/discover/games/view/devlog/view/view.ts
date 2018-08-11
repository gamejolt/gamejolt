import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';

import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { FiresidePost } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppDevlogPostView } from '../../../../../../components/devlog/post/view/view';
import { Registry } from '../../../../../../../lib/gj-lib-client/components/registry/registry.service';
import { RouteState, RouteStore } from '../../view.store';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { enforceLocation } from '../../../../../../../lib/gj-lib-client/utils/router';
import { IntentService } from '../../../../../../components/intent/intent.service';
import { Translate } from '../../../../../../../lib/gj-lib-client/components/translate/translate.service';
import { CommentModal } from '../../../../../../../lib/gj-lib-client/components/comment/modal/modal.service';
import { CreateElement } from 'vue/types/vue';

@Component({
	name: 'RouteDiscoverGamesViewDevlogView',
	components: {
		AppDevlogPostView,
	},
})
export default class RouteDiscoverGamesViewDevlogView extends BaseRouteComponent {
	@Prop() postSlug: string;

	@RouteState game: RouteStore['game'];

	post: FiresidePost | null = null;

	@RouteResolve({ lazy: true, cache: true })
	async routeResolve(this: undefined, route: Route) {
		const intentRedirect = IntentService.checkRoute(route, {
			intent: 'like-post',
			message: Translate.$gettext(`You like this post! That's cool.`),
		});
		if (intentRedirect) {
			return intentRedirect;
		}

		const postHash = FiresidePost.pullHashFromUrl(route.params.postSlug);
		const payload = await Api.sendRequest(
			'/web/discover/games/devlog/' + route.params.id + '/' + postHash
		);

		if (payload && payload.post) {
			const redirect = enforceLocation(route, { postSlug: payload.post.slug });
			if (redirect) {
				return redirect;
			}
		}

		return payload;
	}

	get routeTitle() {
		return this.post ? this.post.title : null;
	}

	routeInit() {
		CommentModal.checkPermalink(this.$router);

		const hash = FiresidePost.pullHashFromUrl(this.postSlug);
		this.post = Registry.find<FiresidePost>('FiresidePost', hash, 'hash');
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
		return h(AppDevlogPostView, {
			props: {
				post: this.post,
			},
		});
	}
}
