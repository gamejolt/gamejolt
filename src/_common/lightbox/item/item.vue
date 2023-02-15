<script lang="ts">
import { nextTick } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import { onScreenResize, Screen } from '../../screen/screen-service';
import AppSketchfabEmbed from '../../sketchfab/embed/embed.vue';
import { useEventSubscription } from '../../system/event/event-topic';
import AppVideoEmbed from '../../video/embed/embed.vue';
import { getVideoPlayerFromSources } from '../../video/player/controller';
import AppVideo from '../../video/AppVideo.vue';
import { LightboxConfig, LightboxMediaModel } from '../lightbox-helpers';

@Options({
	components: {
		AppVideoEmbed,
		AppSketchfabEmbed,
		AppImgResponsive,
		AppMediaItemBackdrop,
		AppVideo,
	},
})
export default class AppLightboxItem extends Vue {
	@Prop(Object) item!: LightboxMediaModel;
	@Prop(Number) itemIndex!: number;
	@Prop(Number) activeIndex!: number;

	isActive = false;
	isNext = false;
	isPrev = false;
	initialized = false;

	maxWidth = 0;
	maxHeight = 0;

	declare $refs: {
		caption: HTMLDivElement;
	};

	get shouldVideoPlay() {
		return this.isActive;
	}

	get isGifWithoutVideo() {
		return (
			this.mediaItem.is_animated &&
			!this.mediaItem.mediaserver_url_mp4 &&
			!this.mediaItem.mediaserver_url_webm
		);
	}

	get mediaType() {
		return this.item.getMediaType();
	}

	get mediaItem() {
		return this.item.getMediaItem()!;
	}

	// get lightbox() {
	// 	return getActiveLightbox();
	// }

	get videoController() {
		const sources = {
			mp4: this.mediaItem.mediaserver_url_mp4,
			webm: this.mediaItem.mediaserver_url_webm,
		};
		return getVideoPlayerFromSources(sources, 'gif', this.mediaItem.mediaserver_url);
	}

	created() {
		useEventSubscription(onScreenResize, () => this.calcDimensions());
	}

	async mounted() {
		await this.calcActive();
		await this.calcDimensions();

		this.initialized = true;
	}

	@Watch('activeIndex')
	activeIndexChange() {
		this.calcActive();
	}

	async calcDimensions() {
		await nextTick();

		if (Screen.isXs) {
			return;
		}

		// Very fragile. Kinda lame.
		this.maxWidth = Screen.width - LightboxConfig.buttonSize * 2;
		this.maxHeight = Screen.height - LightboxConfig.controlsHeight * 2;

		if (this.$refs.caption) {
			this.maxHeight -= this.$refs.caption.offsetHeight;
		}

		if (this.item.getMediaType() === 'image') {
			const dimensions = this.item
				.getMediaItem()!
				.getDimensions(this.maxWidth, this.maxHeight);
			this.maxWidth = dimensions.width;
			this.maxHeight = dimensions.height;
		}
	}

	async calcActive() {
		this.isActive = this.activeIndex === this.itemIndex;
		this.isNext = this.activeIndex + 1 === this.itemIndex;
		this.isPrev = this.activeIndex - 1 === this.itemIndex;

		this.$el.classList.remove('active', 'next', 'prev');

		if (this.isActive) {
			this.$el.classList.add('active');
		} else if (this.isPrev) {
			this.$el.classList.add('prev');
		} else if (this.isNext) {
			this.$el.classList.add('next');
		}

		if (this.isActive || this.isNext || this.isPrev) {
			this.calcDimensions();
		}
	}
}
</script>

<template>
	<div class="media-bar-lightbox-item">
		<div v-if="isActive || isNext || isPrev" class="-inner">
			<!-- Image -->
			<template v-if="mediaType === 'image'">
				<div class="-embed">
					<!-- The min/max will be the actual dimensions for the image thumbnail. -->
					<AppMediaItemBackdrop
						:media-item="mediaItem"
						:style="{
							width: maxWidth ? maxWidth + 'px' : undefined,
							height: maxHeight ? maxHeight + 'px' : undefined,
							marginLeft: 'auto',
							marginRight: 'auto',
							maxWidth: `${mediaItem.width}px`,
						}"
						radius="lg"
					>
						<AppImgResponsive
							v-if="!mediaItem.is_animated || !shouldVideoPlay"
							class="-img"
							:src="item.img_thumbnail"
							:alt="item.caption"
						/>
						<img
							v-else-if="isGifWithoutVideo"
							class="img-responsive"
							:src="mediaItem.img_url"
							:alt="item.caption"
						/>
						<AppVideo
							v-else-if="videoController"
							class="-video"
							:player="videoController"
							show-loading
						/>
					</AppMediaItemBackdrop>
				</div>

				<div v-if="item.caption" ref="caption" class="-caption">
					<h4>{{ item.caption }}</h4>
				</div>
			</template>

			<!-- Video -->
			<template v-else-if="mediaType === 'video'">
				<div v-if="isActive" class="-embed">
					<!-- We want to wait until the size is properly calculated, otherwise the player won't size properly. -->
					<AppVideoEmbed
						v-if="initialized"
						:video-provider="item.type"
						:video-id="item.url"
						:max-video-width="maxWidth"
						:max-video-height="maxHeight"
						autoplay
					/>
				</div>

				<div v-if="item.title || item.description" ref="caption" class="-caption">
					<h4>{{ item.title }}</h4>
					<p v-if="item.description" v-text="item.description" />
				</div>
			</template>

			<!-- Sketchfab -->
			<template v-else-if="mediaType === 'sketchfab'">
				<div v-if="isActive" class="-embed">
					<AppSketchfabEmbed
						:sketchfab-id="item.sketchfab_id"
						:max-width="maxWidth"
						:max-height="maxHeight"
						:autoplay="true"
					/>
				</div>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" src="./item.styl" scoped></style>
