<script lang="ts">
import { PropType, computed, ref, toRef, toRefs } from 'vue';
import {
	FiresidePostEmbedModel,
	TYPE_SKETCHFAB,
	TYPE_YOUTUBE,
} from '../../../../../_common/fireside/post/embed/embed.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import AppResponsiveDimensions from '../../../../../_common/responsive-dimensions/AppResponsiveDimensions.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import AppSketchfabEmbed from '../../../../../_common/sketchfab/embed/AppSketchfabEmbed.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppVideoEmbed from '../../../../../_common/video/embed/AppVideoEmbed.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height * 0.5}px` });
</script>

<script lang="ts" setup>
const props = defineProps({
	embed: {
		type: Object as PropType<FiresidePostEmbedModel>,
		required: true,
	},
	hideOutview: {
		type: Boolean,
		default: true,
	},
});

const { embed, hideOutview } = toRefs(props);

const isOpen = ref(false);
const shouldAutoplay = ref(true);
const isInview = ref(true);

const shouldShow = toRef(
	() => embed.value.type === TYPE_YOUTUBE || embed.value.type === TYPE_SKETCHFAB
);

const thumbUrl = computed(() => {
	if (embed.value.metadata && embed.value.metadata.image_media_item) {
		return embed.value.metadata.image_media_item.mediaserver_url;
	}

	switch (embed.value.type) {
		case TYPE_YOUTUBE: {
			const videoId = embed.value.extraData.videoId;
			return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
		}
	}

	return undefined;
});

const title = computed(() => {
	if (embed.value.metadata && embed.value.metadata.title) {
		return embed.value.metadata.title;
	}

	switch (embed.value.type) {
		case TYPE_YOUTUBE:
			return $gettext(`YouTube`);
		case TYPE_SKETCHFAB:
			return $gettext(`Sketchfab`);
		default:
			return undefined;
	}
});

const website = computed(() => {
	if (embed.value.metadata && embed.value.metadata.site_url) {
		// Node SSR doesn't support the URL api.
		if (import.meta.env.SSR) {
			return embed.value.metadata.site_url;
		}

		const url = new URL(embed.value.metadata.site_url);
		let website = url.hostname;
		if (
			embed.value.metadata.site_name &&
			embed.value.metadata.site_name !== embed.value.metadata.url
		) {
			website = embed.value.metadata.site_name + ' | ' + website;
		}
		return website;
	}

	switch (embed.value.type) {
		case TYPE_YOUTUBE:
			return 'youtube.com';
		case TYPE_SKETCHFAB:
			return 'sketchfab.com';
		default:
			return undefined;
	}
});

const description = computed(() => {
	if (embed.value.metadata) {
		if (embed.value.metadata.description) {
			return embed.value.metadata.description.replace('\n', ' ');
		}

		if (embed.value.metadata.site_name) {
			return embed.value.metadata.site_name;
		}

		return embed.value.metadata.site_url;
	}

	return embed.value.url;
});

const shouldShowEmbedContent = toRef(() => isInview.value || !hideOutview.value);
const imageAlt = toRef(() => embed.value.metadata?.image_alt);

const playIcon = computed(() => {
	switch (embed.value.type) {
		case TYPE_SKETCHFAB:
			return 'sketchfab';
		case TYPE_YOUTUBE:
			return 'play';
	}

	return 'blog-article';
});

function onClick() {
	if (embed.value.is_processing) {
		return;
	}

	if (!isOpen.value) {
		isOpen.value = true;
	} else {
		Navigate.newWindow(embed.value.url);
	}
}

function onInviewChanged(isInviewNew: boolean) {
	isInview.value = isInviewNew;

	// Disable autoplay when it was already opened
	if (!isInviewNew && isOpen.value) {
		shouldAutoplay.value = false;
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
import hide from '@popperjs/core/lib/modifiers/hide';
import { toRefs } from 'vue';

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
