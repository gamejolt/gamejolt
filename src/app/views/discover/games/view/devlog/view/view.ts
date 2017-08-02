import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./view.html?style=./view.styl';

import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { FiresidePost } from '../../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { AppAd } from '../../../../../../../lib/gj-lib-client/components/ad/ad';
import { AppDevlogPostView } from '../../../../../../components/devlog/post/view/view';
import { AppDevlogPostViewPlaceholder } from '../../../../../../components/devlog/post/view/placeholder/placeholder';
import { AppScrollWhen } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll-when.directive.vue';
import { Registry } from '../../../../../../../lib/gj-lib-client/components/registry/registry.service';
import { RouteState, RouteStore } from '../../view.store';
import { AppAdPlacement } from '../../../../../../../lib/gj-lib-client/components/ad/placement/placement';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { enforceLocation } from '../../../../../../../lib/gj-lib-client/utils/router';

@View
@Component({
	name: 'RouteDiscoverGamesViewDevlogView',
	components: {
		AppAd,
		AppAdPlacement,
		AppDevlogPostView,
		AppDevlogPostViewPlaceholder,
	},
	directives: {
		AppScrollWhen,
	},
})
export default class RouteDiscoverGamesViewDevlogView extends BaseRouteComponent {
	@Prop() postSlug: string;

	@RouteState game: RouteStore['game'];

	post: FiresidePost | null = null;

	Screen = makeObservableService(Screen);

	@RouteResolve({ lazy: true, cache: true })
	async routeResolve(this: undefined, route: VueRouter.Route) {
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

	routeInit() {
		const hash = FiresidePost.pullHashFromUrl(this.postSlug);
		this.post = Registry.find<FiresidePost>('FiresidePost', hash, 'hash');
	}

	routed() {
		const post = new FiresidePost(this.$payload.post);
		if (this.post) {
			this.post.assign(post);
		} else {
			this.post = post;
		}

		this.post.$viewed();
		this.post.$expanded();

		Meta.title = this.post.title;
		Meta.description = this.$payload.metaDescription;
		Meta.fb = this.$payload.fb;
		Meta.twitter = this.$payload.twitter;
	}
}
