import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { arrayShuffle } from '../../../../utils/array';
import AppAppButtons from '../../../../_common/app-buttons/app-buttons.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { Store } from '../../../store/index';
import AppHomeFsPost from './_fs-post/fs-post.vue';

@Component({
	name: 'HomeSlider',
	components: {
		AppAuthJoin: AppAuthJoinLazy,
		AppHomeFsPost,
		AppAppButtons,
		AppThemeSvg,
	},
})
export default class AppHomeSlider extends Vue {
	@State app!: Store['app'];

	@Prop({ type: Array, required: true })
	posts!: FiresidePost[];

	shuffledPosts: FiresidePost[] = [];
	currentPostIndex = 0;
	firstPost: FiresidePost | null = null;
	secondPost: FiresidePost | null = null;
	nextPostLoaded = false;

	shouldTransitionPosts = false;
	transitioningPosts = false;

	readonly Environment = Environment;
	readonly Screen = Screen;

	created() {
		this.$watch(
			() => this.posts,
			() => {
				if (this.posts.length >= 2) {
					this.shuffledPosts = arrayShuffle([...this.posts]);
					this.next();
				}
			}
		);

		this.$watch(
			() => this.shouldTransitionPosts && this.nextPostLoaded,
			startTransition => {
				if (startTransition) {
					this.transitioningPosts = true;
					setTimeout(() => this.next(), 2_000);
				}
			}
		);
	}

	next() {
		this.firstPost = this.shuffledPosts[this.currentPostIndex];

		// Wrap around if needed.
		this.currentPostIndex =
			this.currentPostIndex === this.shuffledPosts.length - 1 ? 0 : this.currentPostIndex + 1;

		this.secondPost = this.shuffledPosts[this.currentPostIndex];
		this.nextPostLoaded = false;
		this.transitioningPosts = false;

		this.shouldTransitionPosts = false;
		setTimeout(() => (this.shouldTransitionPosts = true), 8_000);
	}

	onNextPostLoaded() {
		this.nextPostLoaded = true;
	}
}
