import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import AppPostCardPlaceholder from '../../../../components/fireside/post/card/card-placeholder.vue';
import AppPostCard from '../../../../components/fireside/post/card/card.vue';

@Component({
	components: {
		AppPostCard,
		AppPostCardPlaceholder,
		AppScrollScroller,
	},
})
export default class AppPostPageRecommendations extends Vue {
	@Prop({ type: Array, required: true })
	posts!: FiresidePost[];

	get shouldScroll() {
		return Screen.isXs;
	}

	get usablePosts() {
		if (Screen.isSm && !this.shouldScroll) {
			return this.posts.slice(0, 8);
		}

		return this.posts;
	}
}
