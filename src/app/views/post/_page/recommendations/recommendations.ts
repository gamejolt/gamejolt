import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Api } from '../../../../../_common/api/api.service';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppPostCard from '../../../../components/fireside/post/card/card.vue';

@Component({
	components: {
		AppPostCard,
	},
})
export default class AppPostPageRecommendations extends Vue {
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;

	posts: FiresidePost[] | null = null;

	async created() {
		const payload = await Api.sendRequest(
			`/web/posts/recommendations/${this.post.id}`,
			undefined,
			{ detach: true }
		);

		this.posts = FiresidePost.populate(payload.posts);
	}
}
