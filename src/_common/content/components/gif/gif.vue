<script lang="ts">
import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { ContentFocus } from '../../../content-focus/content-focus.service';
import { AppResponsiveDimensions } from '../../../responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '../../../scroll/inview/AppScrollInview.vue';
import { getVideoPlayerFromSources } from '../../../video/player/controller';
import AppVideo from '../../../video/video.vue';
import { ContentOwnerController, ContentOwnerControllerKey } from '../../content-owner';
import AppBaseContentComponent from '../base/base-content-component.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height * 0.25}px` });

@Options({
	components: {
		AppBaseContentComponent,
		AppScrollInview,
		AppVideo,
		AppResponsiveDimensions,
	},
})
export default class AppContentGif extends Vue {
	@Prop({ type: String, required: true }) gifId!: string;
	@Prop({ type: Number, required: true }) width!: number;
	@Prop({ type: Number, required: true }) height!: number;
	@Prop({ type: String, required: true }) service!: string;
	@Prop({ type: Object, required: true }) media!: any;
	@Prop({ type: Boolean, required: true }) isEditing!: boolean;
	@Prop({ type: Boolean, required: true }) isDisabled!: boolean;

	@Inject({ from: ContentOwnerControllerKey })
	owner!: ContentOwnerController;

	declare $refs: {
		container: HTMLElement;
	};

	isInview = false;
	readonly InviewConfig = InviewConfig;

	@Emit('removed')
	emitRemoved() {}

	get shouldPlay() {
		return ContentFocus.isWindowFocused;
	}

	get videoController() {
		if (!this.media || !this.media.mp4.url || !this.media.webm.url) {
			return undefined;
		}

		const sourcesPayload = {
			mp4: this.media.mp4.url,
			webm: this.media.webm.url,
		};

		return getVideoPlayerFromSources(sourcesPayload, 'gif', this.media.preview);
	}

	get maxWidth() {
		const { container } = this.$refs;
		const maxOwnerWidth = this.owner.contentRules.maxMediaWidth;
		if (maxOwnerWidth !== null) {
			return Math.min(maxOwnerWidth, container ? container.clientWidth : this.width);
		}

		return this.width;
	}

	get maxHeight() {
		const maxOwnerHeight = this.owner.contentRules.maxMediaHeight;
		if (maxOwnerHeight !== null) {
			return Math.min(maxOwnerHeight, this.height);
		}

		return this.height;
	}

	onRemoved() {
		this.emitRemoved();
	}

	onInviewChange(inview: boolean) {
		this.isInview = inview;
	}
}
</script>

<template>
	<app-base-content-component
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		@removed="onRemoved"
	>
		<div class="-outer content-gif">
			<app-responsive-dimensions
				ref="container"
				class="-container"
				:ratio="width / height"
				:max-width="maxWidth"
				:max-height="maxHeight"
			>
				<app-scroll-inview
					:config="InviewConfig"
					@inview="onInviewChange(true)"
					@outview="onInviewChange(false)"
				>
					<img class="-poster" :src="media.preview" />
					<app-video
						v-if="isInview && videoController"
						class="-video"
						:player="videoController"
						:should-play="shouldPlay"
					/>
				</app-scroll-inview>
			</app-responsive-dimensions>
		</div>
	</app-base-content-component>
</template>

<style lang="stylus" scoped>
.-outer
	width: 100%
	display: flex
	flex-direction: column
	margin-bottom: $line-height-computed
	min-height: 44px // make sure the X button fits properly, usually not a problem unless the image is super wide
	align-items: center

.-container
	display: flex
	justify-content: center
	align-items: center
	rounded-corners-lg()
	overflow: hidden
	max-width: 100%
	position: relative

.-video
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	rounded-corners-lg()

.-poster
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	rounded-corners-lg()
</style>
