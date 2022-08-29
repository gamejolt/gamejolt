<script lang="ts">
import { computed } from 'vue';
import { setup } from 'vue-class-component';
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../../../_common/analytics/analytics.service';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { createLightbox } from '../../../../../../_common/lightbox/lightbox-helpers';
import AppMediaItemPost from '../../../../../../_common/media-item/post/post.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppTouch, { AppTouchInput } from '../../../../../../_common/touch/AppTouch.vue';
import AppEventItemMediaIndicator from '../../../../event-item/media-indicator/AppEventItemMediaIndicator.vue';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../../view';

@Options({
	components: {
		AppMediaItemPost,
		AppEventItemMediaIndicator,
		AppTouch,
	},
})
export default class AppActivityFeedPostMedia extends Vue {
	@Prop({ type: Object, required: true })
	item!: ActivityFeedItem;

	@Prop({ type: Object, required: true })
	post!: FiresidePost;

	@Prop({ type: Boolean, required: false, default: false })
	canPlaceSticker!: boolean;

	@Inject({ from: ActivityFeedKey })
	feed!: ActivityFeedView;

	page = 1;
	isDragging = false;

	lightbox = setup(() => {
		return createLightbox(computed(() => (this.$props as this).post.media));
	});

	readonly Screen = Screen;

	declare $refs: {
		slider: HTMLElement;
	};

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	goNext() {
		if (this.page >= this.post.media.length) {
			this._updateSliderOffset();
			return;
		}

		this.page = Math.min(this.page + 1, this.post.media.length);
		this._updateSliderOffset();
		Analytics.trackEvent('activity-feed', 'media-next');
	}

	goPrev() {
		if (this.page <= 1) {
			this._updateSliderOffset();
			return;
		}

		this.page = Math.max(this.page - 1, 1);
		this._updateSliderOffset();
		Analytics.trackEvent('activity-feed', 'media-prev');
	}

	async onItemBootstrapped() {
		this._updateSliderOffset();
	}

	private _updateSliderOffset(extraOffsetPx = 0) {
		const pagePercent = this.page - 1;
		const slider = this.$refs.slider;
		const pagePx = slider.offsetWidth * -pagePercent;
		slider.style.transform = `translate3d( ${pagePx + extraOffsetPx}px, 0, 0 )`;
	}

	panStart() {
		this.isDragging = true;
	}

	pan(event: AppTouchInput) {
		// In case the animation frame was retrieved after we stopped dragging.
		if (!this.isDragging) {
			return;
		}

		this._updateSliderOffset(event.deltaX);
	}

	panEnd(event: AppTouchInput) {
		this.isDragging = false;

		// Make sure we moved at a high enough velocity and/or distance to register the "swipe".
		const { velocityX, deltaX, distance } = event;

		if (
			// Check if it was a fast flick,
			(Math.abs(velocityX) > 0.55 && distance > 10) ||
			// or if the pan distance was at least ~1/3 of the content area.
			Math.abs(deltaX) >= this.$el.clientWidth / 3
		) {
			if (velocityX > 0 || deltaX > 0) {
				this.goPrev();
			} else {
				this.goNext();
			}
			return;
		}

		this._updateSliderOffset();
	}

	onClickFullscreen() {
		this.lightbox.show(this.page - 1);
		Analytics.trackEvent('activity-feed', 'media-fullscreen');
	}
}
</script>

<template>
	<div class="post-media">
		<AppTouch
			class="-lightbox"
			:pan-options="{ direction: 'horizontal' }"
			@panstart="panStart"
			@panmove="pan"
			@panend="panEnd"
		>
			<div class="-container">
				<div ref="slider" class="-slider">
					<AppMediaItemPost
						v-for="(mediaItem, index) of post.media"
						:key="mediaItem.id"
						:media-item="mediaItem"
						:is-post-hydrated="isHydrated"
						:is-active="index === page - 1"
						:can-place-sticker="canPlaceSticker"
						restrict-device-max-height
						inline
						@bootstrap="onItemBootstrapped()"
						@fullscreen="onClickFullscreen"
					/>
				</div>
			</div>

			<template v-if="post.media.length > 1">
				<div class="-prev" :class="{ '-hide': page === 1 }" @click.stop="goPrev">
					<AppJolticon icon="chevron-left" />
				</div>

				<div
					class="-next"
					:class="{ '-hide': page === post.media.length }"
					@click.stop="goNext"
				>
					<AppJolticon icon="chevron-right" />
				</div>
			</template>
		</AppTouch>

		<AppEventItemMediaIndicator
			v-if="post.media.length > 1"
			class="-indicator"
			:count="post.media.length"
			:current="page"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../variables'

$-button-size = 60px

.post-media
	margin-top: $-item-padding-xs-v
	position: relative

	@media $media-sm-up
		margin-top: $-item-padding-v

	&:hover
		.-next
		.-prev
			visibility: visible
			opacity: 1

.-container
	display: block
	overflow: hidden
	margin-left: -($-item-padding-xs)
	margin-right: -($-item-padding-xs)

	@media $media-sm-up
		margin-left: -($-item-padding-container)
		margin-right: -($-item-padding-container)

.-slider
	white-space: nowrap
	transition: transform 300ms $strong-ease-out

.-hide
	opacity: 0 !important
	transition: none !important

.-prev
.-next
	position: absolute
	top: 'calc(50% - (%s / 2))' % $-button-size
	display: flex
	align-items: center
	justify-content: center
	width: $-button-size
	height: @width
	background-color: rgba($black, 0.65)
	visibility: hidden
	opacity: 0
	z-index: 2
	transition: opacity 0.2s ease, visibility 0.2s

	// Hide and disable slider controls for mobile devices
	@media screen and (pointer: coarse)
		display: none

	> .jolticon
		color: var(--dark-theme-fg)
		font-size: ($-button-size / 2)

	&:hover
		background-color: var(--theme-bi-bg)

		> .jolticon
			color: var(--theme-bi-fg)

.-prev
	left: -($-item-padding-container)
	border-top-right-radius: $border-radius-large
	border-bottom-right-radius: $border-radius-large

.-next
	right: -($-item-padding-container)
	border-top-left-radius: $border-radius-large
	border-bottom-left-radius: $border-radius-large

.-indicator
	margin-top: 10px
</style>
