import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppResponsiveDimensions } from 'game-jolt-frontend-lib/components/responsive-dimensions/responsive-dimensions';
import AppSketchfabEmbed from 'game-jolt-frontend-lib/components/sketchfab/embed/embed.vue';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedView } from '../../view';

@Component({
	components: {
		AppJolticon,
		AppSketchfabEmbed,
		AppResponsiveDimensions,
	},
})
export default class AppActivityFeedDevlogPostSketchfab extends Vue {
	@Inject()
	feed!: ActivityFeedView;

	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	@Prop(FiresidePost)
	post!: FiresidePost;

	isShowing = GJ_IS_SSR;
	contentBootstrapped = false;

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get sketchfab() {
		return this.post.sketchfabs[0];
	}

	async onDimensionsChange() {
		if (!this.contentBootstrapped) {
			this.contentBootstrapped = true;

			await this.$nextTick();
			this.$emit('content-bootstrapped');
		}
	}

	play() {
		this.isShowing = true;
		this.$emit('expanded');
	}
}
