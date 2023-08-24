<script lang="ts">
import { defineAsyncComponent } from 'vue';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { FiresideModel } from '../../../../../_common/fireside/fireside.model';

@Options({
	components: {
		AppFiresideStreamPreviewVideo: defineAsyncComponent(
			() => import('./AppFiresideStreamPreviewVideo.vue')
		),
	},
})
export default class AppFiresideStreamPreview extends Vue {
	@Prop({ type: Object, required: true })
	fireside!: FiresideModel;

	@Prop({ type: Boolean, default: true })
	showLive!: FiresideModel;

	@Prop({ type: Boolean })
	showLiveUsers!: FiresideModel;

	@Emit('changed') emitChanged(_hasVideo: boolean, _isStreaming: boolean) {}

	get location() {
		return this.fireside.routeLocation;
	}

	onVideoChanged(hasVideo: boolean, isStreaming: boolean) {
		this.emitChanged(hasVideo, isStreaming);
	}
}
</script>

<template>
	<div class="-preview-container sheet sheet-full sheet-elevate">
		<router-link class="-link" :to="location">
			<div class="-video-wrapper">
				<div class="-video-inner">
					<AppFiresideStreamPreviewVideo
						:key="fireside.id"
						:fireside="fireside"
						:show-live="showLive"
						:show-live-users="showLiveUsers"
						@changed="onVideoChanged"
					/>
				</div>
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
.-preview-container
	position: relative
	overflow: hidden

.-link
	width: 100%
	color: $white

.-video-wrapper
	overflow: hidden
	position: relative
	background-color: var(--theme-bg-offset)
	width: 100%
	padding-top: (100% / (16 / 9))

.-video-inner
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
</style>
