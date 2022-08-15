<script lang="ts">
import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import AppResponsiveDimensions from '../../../../../_common/responsive-dimensions/AppResponsiveDimensions.vue';
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

	isShowingVideo = import.meta.env.SSR;
	shouldAutoplay = !import.meta.env.SSR;

	play() {
		this.isShowingVideo = true;
		this.emitPlay();
	}
}
</script>

<template>
	<div class="-video-embed">
		<AppResponsiveDimensions :ratio="16 / 9">
			<AppVideoEmbed v-if="isHydrated" video-provider="youtube" :video-id="videoId" />
		</AppResponsiveDimensions>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

.-video-embed
	change-bg('bg-offset')
	margin-top: $-item-padding-xs-v
	margin-left: -($-item-padding-xs)
	margin-right: -($-item-padding-xs)

	@media $media-sm-up
		margin-top: $-item-padding-v
		margin-left: -($-item-padding-container)
		margin-right: -($-item-padding-container)
</style>
