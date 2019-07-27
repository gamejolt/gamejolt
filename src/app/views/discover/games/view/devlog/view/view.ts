import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { CommentThreadModal } from 'game-jolt-frontend-lib/components/comment/thread/modal.service';
import { ContentDocument } from 'game-jolt-frontend-lib/components/content/content-document';
import { MentionCache } from 'game-jolt-frontend-lib/components/content/mention-cache';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import { Registry } from 'game-jolt-frontend-lib/components/registry/registry.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { enforceLocation } from 'game-jolt-frontend-lib/utils/router';
import { Component } from 'vue-property-decorator';
import { CreateElement } from 'vue/types/vue';
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
			const redirect = enforceLocation(route, { postSlug: payload.post.slug });
			if (redirect) {
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

	get routeTitle() {
		if (!this.post || !this.game) {
			return null;
		}

		return this.$gettextInterpolate(
			`${this.post.lead_snippet} - ${this.game.title} by %{ user }`,
			{ user: this.post.user.display_name }
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

		MentionCache.add(this.$route, 'Fireside_Post-' + this.post.id + '-owner', this.post.user);
		if (this.post.user.id !== this.game.developer.id) {
			MentionCache.add(this.$route, 'Game-' + this.game.id + '-owner', this.game.developer);
		}
		const leadDoc = ContentDocument.fromJson(this.post.lead_content);
		MentionCache.addFromDoc(
			this.$route,
			'Fireside_Post-' + this.post.id + '-lead-mentions',
			leadDoc
		);
		if (this.post.hasArticle) {
			const articleDoc = ContentDocument.fromJson(this.post.article_content);
			MentionCache.addFromDoc(
				this.$route,
				'Fireside_Post-' + this.post.id + '-article-mentions',
				articleDoc
			);
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
