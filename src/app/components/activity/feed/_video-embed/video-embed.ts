import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { AppResponsiveDimensions } from '../../../../../_common/responsive-dimensions/responsive-dimensions';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';
import { ActivityFeedKey, ActivityFeedView } from '../view';

@Component({
	components: {
		AppVideoEmbed,
		AppResponsiveDimensions,
	},
})
export default class AppActivityFeedVideoEmbed extends Vue {
	@Prop({ type: String, required: true })
	videoId!: string;

	@Prop({ type: String, required: true })
	thumbnail!: string;

	@Prop({ type: Boolean, required: true })
	isHydrated!: boolean;

	@Inject({ from: ActivityFeedKey })
	feed!: ActivityFeedView;

	isShowingVideo = GJ_IS_SSR;
	shouldAutoplay = !GJ_IS_SSR;

	play() {
		this.isShowingVideo = true;
		this.$emit('play');
	}
}
