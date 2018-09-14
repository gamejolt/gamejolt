import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';

import { AppDevlogPostView } from '../../../components/devlog/post/view/view';
import { CreateElement } from 'vue/types/vue';
import { RouteState, RouteStore } from '../profile.store';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { IntentService } from '../../../components/intent/intent.service';
import { Translate } from '../../../../lib/gj-lib-client/components/translate/translate.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { enforceLocation } from '../../../../lib/gj-lib-client/utils/router';
import { CommentModal } from '../../../../lib/gj-lib-client/components/comment/modal/modal.service';
import { Registry } from '../../../../lib/gj-lib-client/components/registry/registry.service';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@Component({
	name: 'RouteProfilePostView',
	components: {
		AppDevlogPostView,
	},
})
export default class RouteProfilePostView extends BaseRouteComponent {
	@Prop()
	slug!: string;

	@RouteState
	user!: RouteStore['user'];

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

		const postHash = FiresidePost.pullHashFromUrl(route.params.slug);
		const payload = await Api.sendRequest(
			'/web/profile/post/' + route.params.username + '/' + postHash
		);

		if (payload && payload.post) {
			const redirect = enforceLocation(route, {
				username: payload.post.user.username,
				slug: payload.post.slug,
			});
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

		const hash = FiresidePost.pullHashFromUrl(this.slug);
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
