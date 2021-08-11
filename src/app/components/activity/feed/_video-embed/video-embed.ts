import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { AppResponsiveDimensions } from '../../../../../_common/responsive-dimensions/responsive-dimensions';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';
import { ActivityFeedKey, ActivityFeedView } from '../view';

@Options({
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

	@Emit('play')
	emitPlay() {}

	isShowingVideo = GJ_IS_SSR;
	shouldAutoplay = !GJ_IS_SSR;

	play() {
		this.isShowingVideo = true;
		this.emitPlay();
	}
}
