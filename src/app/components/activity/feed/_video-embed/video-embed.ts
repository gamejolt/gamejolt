import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
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
	@Prop(propRequired(String)) videoId!: string;
	@Prop(propRequired(String)) thumbnail!: string;
	@Prop(propRequired(Boolean)) isHydrated!: boolean;

	@Inject(ActivityFeedKey) feed!: ActivityFeedView;

	isShowingVideo = GJ_IS_SSR;
	shouldAutoplay = !GJ_IS_SSR;

	play() {
		this.isShowingVideo = true;
		this.$emit('play');
	}
}
