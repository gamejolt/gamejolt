<script lang="ts">
import ResizeSensor from 'css-element-queries/src/ResizeSensor';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';
import AppMediaItemBackdrop from '../backdrop/AppMediaItemBackdrop.vue';
import { MediaItem } from '../media-item-model';

@Options({
	components: {
		AppImgResponsive,
		AppMediaItemBackdrop,
	},
})
export default class AppMediaItemCover extends Vue {
	@Prop(Object) mediaItem!: MediaItem;
	@Prop(Number) maxHeight?: number;
	@Prop(Boolean) blur?: boolean;

	isLoaded = false;
	height = 'auto';

	@Emit('loaded')
	emitLoaded() {}

	created() {
		if (import.meta.env.SSR) {
			this.recalcHeight();
			this.isLoaded = true;
		}
	}

	mounted() {
		this.recalcHeight();

		new ResizeSensor(this.$el, () => this.recalcHeight());
	}

	@Watch('mediaItem')
	@Watch('maxHeight')
	changes() {
		this.recalcHeight();
	}

	recalcHeight() {
		// Resize counter is just to trigger this getter any time window is
		// resized.
		if (this.mediaItem) {
			if (this.$el) {
				const newDimensions = this.mediaItem.getDimensions(
					Ruler.width(this.$el as HTMLElement),
					undefined,
					{
						force: true,
					}
				);

				// We extend the header to the right and left by 20% on XS since
				// the screen is so small. This makes sure that we also
				// calculate the height larger.
				if (Screen.isXs) {
					newDimensions.height *= 1.4;
				}

				if (this.maxHeight && newDimensions.height > this.maxHeight) {
					newDimensions.height = this.maxHeight;
				}

				this.height = newDimensions.height + 'px';
				return;
			}

			// If no element yet, set the height to auto.
			this.height = 'auto';
			return;
		}

		// Make sure it's collapsed if there is no header.
		this.height = '0';
	}

	onLoadChange(isLoaded: boolean) {
		this.isLoaded = isLoaded;

		if (this.isLoaded) {
			this.emitLoaded();
		}
	}
}
</script>

<template>
	<div class="media-item-cover-container" :class="{ '-blur': blur }">
		<section class="section media-item-cover" :class="{ loaded: isLoaded }">
			<div class="media-item-cover-img">
				<AppMediaItemBackdrop class="-backdrop" :media-item="mediaItem" :style="{ height }">
					<AppImgResponsive
						v-show="isLoaded"
						:src="mediaItem.mediaserver_url"
						@imgloadchange="onLoadChange"
						alt=""
					/>
				</AppMediaItemBackdrop>
			</div>

			<div class="media-item-cover-content">
				<slot />
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.-backdrop
	display: flex
	align-items: center

.media-item-cover-container
	change-bg('gray')
	display: block
	overflow: hidden
	width: 100%
	height: auto

.media-item-cover
	padding: 0
	position: relative
	overflow: hidden
	height: 100%
	display: flex
	flex-direction: column
	justify-content: center

	&-img
		position: relative
		width: 100%

		@media $media-xs
			width: 140%
			margin-left: -20%

		img
			position: relative
			width: 100%

.-blur
	img
		filter: blur(15px)
</style>
