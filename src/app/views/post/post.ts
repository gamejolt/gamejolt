import { Component } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import { CommentThreadModal } from '../../../_common/comment/thread/modal.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { Meta } from '../../../_common/meta/meta-service';
import { Registry } from '../../../_common/registry/registry.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { Translate } from '../../../_common/translate/translate.service';
import { IntentService } from '../../components/intent/intent.service';
import { RouteStore, RouteStoreModule } from '../profile/profile.store';
import AppPostView from './view/view.vue';

@Component({
	name: 'RoutePostView',
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

		return payload;
	},
})
export default class RoutePost extends BaseRouteComponent {
	@RouteStoreModule.State
	user!: RouteStore['user'];

	post: FiresidePost | null = null;

	get routeTitle() {
		if (!this.post) {
			return null;
		}

		this.disableRouteTitleSuffix = true;

		return this.$gettextInterpolate('%{ user } on Game Jolt: "%{ post }"', {
			user: this.post.user.display_name,
			post: this.post.lead_snippet,
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

		this.post.$viewed();
		this.post.$expanded();

		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;
	}
}
