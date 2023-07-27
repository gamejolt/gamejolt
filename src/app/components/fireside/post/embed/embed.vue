<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import {
	FiresidePostEmbed,
	TYPE_SKETCHFAB,
	TYPE_YOUTUBE,
} from '../../../../../_common/fireside/post/embed/embed.model';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import AppResponsiveDimensions from '../../../../../_common/responsive-dimensions/AppResponsiveDimensions.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import AppSketchfabEmbed from '../../../../../_common/sketchfab/embed/AppSketchfabEmbed.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppVideoEmbed from '../../../../../_common/video/embed/AppVideoEmbed.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height * 0.5}px` });

@Options({
	components: {
		AppVideoEmbed,
		AppScrollInview,
		AppResponsiveDimensions,
		AppSketchfabEmbed,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppFiresidePostEmbed extends Vue {
	@Prop({ type: Object, required: true }) embed!: FiresidePostEmbed;
	@Prop({ type: Boolean, default: true }) hideOutview!: boolean;

	readonly InviewConfig = InviewConfig;
	readonly TYPE_YOUTUBE = TYPE_YOUTUBE;
	readonly TYPE_SKETCHFAB = TYPE_SKETCHFAB;

	isOpen = false;
	shouldAutoplay = true;
	isInview = true;

	get shouldShow() {
		return this.embed.type === TYPE_YOUTUBE || this.embed.type === TYPE_SKETCHFAB;
	}

	get thumbUrl() {
		if (this.embed.metadata && this.embed.metadata.image_media_item) {
			return this.embed.metadata.image_media_item.mediaserver_url;
		}

		switch (this.embed.type) {
			case TYPE_YOUTUBE: {
				const videoId = this.embed.extraData.videoId;
				return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
			}
		}

		return undefined;
	}

	get title() {
		if (this.embed.metadata && this.embed.metadata.title) {
			return this.embed.metadata.title;
		}

		switch (this.embed.type) {
			case TYPE_YOUTUBE:
				return this.$gettext(`YouTube`);
			case TYPE_SKETCHFAB:
				return this.$gettext(`Sketchfab`);
			default:
				return undefined;
		}
	}

	get website() {
		if (this.embed.metadata && this.embed.metadata.site_url) {
			// Node SSR doesn't support the URL api.
			if (import.meta.env.SSR) {
				return this.embed.metadata.site_url;
			}

			const url = new URL(this.embed.metadata.site_url);
			let website = url.hostname;
			if (
				this.embed.metadata.site_name &&
				this.embed.metadata.site_name !== this.embed.metadata.url
			) {
				website = this.embed.metadata.site_name + ' | ' + website;
			}
			return website;
		}

		switch (this.embed.type) {
			case TYPE_YOUTUBE:
				return 'youtube.com';
			case TYPE_SKETCHFAB:
				return 'sketchfab.com';
			default:
				return undefined;
		}
	}

	get description() {
		if (this.embed.metadata) {
			if (this.embed.metadata.description) {
				return this.embed.metadata.description.replace('\n', ' ');
			}

			if (this.embed.metadata.site_name) {
				return this.embed.metadata.site_name;
			}

			return this.embed.metadata.site_url;
		}

		return this.embed.url;
	}

	get shouldShowEmbedContent() {
		return this.isInview || !this.hideOutview;
	}

	get imageAlt() {
		return this.embed.metadata?.image_alt;
	}

	get playIcon() {
		switch (this.embed.type) {
			case TYPE_SKETCHFAB:
				return 'sketchfab';
			case TYPE_YOUTUBE:
				return 'play';
		}

		return 'blog-article';
	}

	onClick() {
		if (this.embed.is_processing) {
			return;
		}

		if (!this.isOpen) {
			this.isOpen = true;
		} else {
			Navigate.newWindow(this.embed.url);
		}
	}

	onInviewChanged(isInview: boolean) {
		this.isInview = isInview;

		// Disable autoplay when it was already opened
		if (!isInview && this.isOpen) {
			this.shouldAutoplay = false;
		}
	}
}
</script>

<template>
	<div
		v-if="shouldShow"
		class="-embed"
		:class="{ '-embed-closed': !isOpen, '-embed-clickable': !embed.is_processing }"
		@click.prevent.stop="onClick"
	>
		<template v-if="embed.is_processing">
			<!-- Placeholder while processing. -->
			<div class="-thumb">
				<div class="-thumb-img-container" />
				<div class="-thumb-play">
					<div class="-thumb-play-icon-bg" />
					<AppJolticon
						v-app-tooltip.touchable="$gettext(`Processing...`)"
						class="-thumb-play-icon"
						icon="broadcast"
						big
					/>
				</div>
			</div>
			<div class="-info">
				<div class="-title">
					<span class="lazy-placeholder" style="width: 90%" />
				</div>
				<div class="-description text-muted">
					<span class="lazy-placeholder" style="width: 80%" />
					<span class="lazy-placeholder" style="width: 40%" />
				</div>

				<div class="text-muted">
					<span class="lazy-placeholder" style="width: 50%" />
				</div>
			</div>
		</template>

		<template v-else>
			<div v-if="!isOpen" class="-thumb" :alt="imageAlt">
				<div class="-thumb-img-container">
					<img v-if="thumbUrl" :src="thumbUrl" class="-thumb-img" />
				</div>
				<div class="-thumb-play">
					<AppJolticon
						class="-thumb-play-icon -thumb-play-icon-play"
						:icon="playIcon"
						big
					/>
				</div>
			</div>
			<div v-else class="-player">
				<AppResponsiveDimensions :ratio="16 / 9">
					<AppScrollInview
						:config="InviewConfig"
						@inview="onInviewChanged(true)"
						@outview="onInviewChanged(false)"
					>
						<template v-if="shouldShowEmbedContent">
							<AppVideoEmbed
								v-if="embed.type === TYPE_YOUTUBE"
								:video-id="embed.extraData.videoId"
								video-provider="youtube"
								:autoplay="shouldAutoplay"
							/>
							<AppSketchfabEmbed
								v-else-if="embed.type === TYPE_SKETCHFAB"
								:sketchfab-id="embed.extraData.modelId"
								:autoplay="shouldAutoplay"
							/>
						</template>
					</AppScrollInview>
				</AppResponsiveDimensions>
			</div>

			<div class="-info" :class="{ '-info-open': isOpen }">
				<div class="-title">
					<b>{{ title }}</b>
				</div>
				<div class="-description text-muted">
					{{ description }}
				</div>

				<div class="text-muted"><AppJolticon icon="link" /> {{ website }}</div>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import './variables'

.-embed
	full-bleed-xs()
	border-style: solid
	border-width: $border-width-base
	border-color: var(--theme-bg-subtle)
	rounded-corners-lg()
	overflow: hidden
	cursor: wait
	transition: background-color 0.2s ease
	margin-bottom: $line-height-computed

	&-closed
		display: flex
		height: $-height

.-embed-clickable
	&:hover
		cursor: pointer
		background-color: var(--theme-bg-offset)

.-thumb
	position: relative
	width: $-thumb-size

	&-img
		position: relative
		display: block
		height: 100%

		&-container
			position: relative
			height: $-thumb-size - 2px
			width: $-thumb-size - 2px
			overflow: hidden
			display: flex
			justify-content: center
			border-right-style: solid
			border-right-width: $border-width-base
			border-right-color: var(--theme-bg-subtle)

	&-play
		position: absolute
		top: 0
		left: 0
		bottom: 0
		right: 0
		display: flex
		justify-content: center
		align-items: center

		&-icon
			z-index: 2

			&-play
				color: white
				filter: drop-shadow(0 0 4px black)

.-info
	margin: $-info-margin
	display: flex
	justify-content: center
	flex-direction: column
	position: relative
	width: calc(100% - 130px)

	&-open
		width: 100%

.-title
	max-width: calc(100% - 24px)
	text-overflow()
	margin-bottom: 4px

.-description
	max-height: $line-height-computed * 2
	overflow: hidden
	max-width: calc(100% - 24px)
	margin-bottom: 4px

.-player
	border-bottom-style: solid
	border-bottom-width: $border-width-base
	border-bottom-color: var(--theme-bg-subtle)
	background-color: var(--theme-bg-offset)
</style>
