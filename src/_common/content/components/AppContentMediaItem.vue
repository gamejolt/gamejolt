<script lang="ts" setup>
import { computed, ref, toRefs, unref } from 'vue';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import { createLightbox } from '../../lightbox/lightbox-helpers';
import AppLinkExternal from '../../link/AppLinkExternal.vue';
import AppLoading from '../../loading/AppLoading.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItem } from '../../media-item/media-item-model';
import AppResponsiveDimensions from '../../responsive-dimensions/AppResponsiveDimensions.vue';
import AppTranslate from '../../translate/AppTranslate.vue';
import { showContentEditorLinkModal } from '../content-editor/modals/link/link-modal.service';
import { defineEditableNodeViewProps } from '../content-editor/node-views/base';
import { useContentOwnerController } from '../content-owner';
import AppBaseContentComponent from './AppBaseContentComponent.vue';

const props = defineProps({
	mediaItemId: {
		type: Number,
		required: true,
	},
	mediaItemWidth: {
		type: Number,
		required: true,
	},
	mediaItemHeight: {
		type: Number,
		required: true,
	},
	caption: {
		type: String,
		required: true,
	},
	align: {
		type: String,
		required: true,
	},
	href: {
		type: String,
		default: '',
	},
	isEditing: {
		type: Boolean,
	},
	isDisabled: {
		type: Boolean,
	},
	...defineEditableNodeViewProps(),
});

const owner = useContentOwnerController()!;

const {
	mediaItemId,
	mediaItemWidth,
	mediaItemHeight,
	caption,
	align,
	href,
	isEditing,
	isDisabled,
	onUpdateAttrs,
} = toRefs(props);

const container = ref<InstanceType<typeof AppResponsiveDimensions>>();
const mediaItem = ref<MediaItem>();
const hasError = ref(false);
const imageLoaded = ref(false);

const lightboxItems = computed(() => (mediaItem.value ? [mediaItem.value] : []));

const title = computed(() => {
	if (mediaItem.value && hasCaption.value) {
		return caption.value;
	}
	if (mediaItem.value && hasLink.value) {
		return displayHref.value;
	}
	if (mediaItem.value instanceof MediaItem) {
		let filename = mediaItem.value.filename;
		// If possible, remove the hash from the filename.
		// The filename is matching the pattern 'filename-8chrhere.ext'
		const hashRegex = /^.+?(-[a-z0-9]{8}(\.[a-z]{1,5}))$/i;
		const results = hashRegex.exec(filename);
		if (results !== null && results.length === 3) {
			// Match for the hash, remove it, and append the file ext.
			filename = filename.substr(0, filename.length - results[1].length) + results[2];
		}
		return filename;
	}
	return '';
});

const hasCaption = computed(() => !!caption.value);

const itemAlignment = computed(() => {
	switch (align.value) {
		case 'left':
			return 'flex-start';
		case 'right':
			return 'flex-end';
	}
	return 'center';
});

const hasLink = computed(() => {
	return typeof href.value === 'string' && href.value.length > 0;
});

const canFullscreenItem = computed(() => {
	if (!mediaItem.value || hasLink.value) {
		return false;
	}

	return !owner.disableLightbox;
});

const displayHref = computed(() => {
	let text = href.value;
	if (text.startsWith('//')) {
		text = text.substr(2);
	}
	if (text.length > 30) {
		text = text.substr(0, 30) + '…';
	}
	return text;
});

const shouldShowPlaceholder = computed(() => {
	// Never show the placeholder for SSR, because the events to clear it are not fired.
	return !imageLoaded.value && !import.meta.env.SSR;
});

const shouldUseMediaserver = computed(() => {
	// For animated media items (gifs):
	// Always return the direct url because gifs do not get returned by mediaserver.
	return !mediaItem.value?.is_animated && !!mediaItem.value?.mediaserver_url;
});

const maxWidth = computed(() => {
	const maxOwnerWidth = owner.contentRules.maxMediaWidth;
	if (maxOwnerWidth !== null) {
		const sizes = [maxOwnerWidth, mediaItemWidth.value];
		if (parentWidth.value) {
			sizes.push(parentWidth.value);
		}
		return Math.min(...sizes);
	}

	return mediaItemWidth.value;
});

const maxHeight = computed(() => {
	const maxOwnerHeight = owner.contentRules.maxMediaHeight;
	if (maxOwnerHeight !== null) {
		return Math.min(maxOwnerHeight, mediaItemHeight.value);
	}

	return mediaItemHeight.value;
});

const parentWidth = computed(() => unref(owner.parentBounds?.width));

const lightbox = createLightbox(lightboxItems);

owner.hydrator.useData('media-item-id', mediaItemId.value.toString(), data => {
	if (data) {
		mediaItem.value = new MediaItem(data);
	} else {
		hasError.value = true;
	}
});

async function onEdit() {
	if (hasLink.value) {
		removeLink();
	} else {
		const result = await showContentEditorLinkModal(href.value);
		if (result !== undefined) {
			onUpdateAttrs?.value?.({ href: result.href });
		}
	}
}

function removeLink() {
	onUpdateAttrs?.value?.({ href: '' });
}

function onImageLoad() {
	imageLoaded.value = true;
}

function onItemFullscreen() {
	if (!canFullscreenItem.value) {
		return;
	}

	lightbox.show();
}
</script>

<template>
	<AppBaseContentComponent
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		show-edit
		@removed="onRemoved?.()"
		@edit="onEdit"
	>
		<div
			class="media-item"
			:class="{
				'-editing': isEditing,
				'-link': hasLink && !isEditing,
			}"
			:style="{
				'align-items': itemAlignment,
			}"
		>
			<AppResponsiveDimensions
				ref="container"
				class="media-item-container"
				:class="{ '-zoomable': canFullscreenItem }"
				:ratio="mediaItem ? mediaItem.width / mediaItem.height : 16 / 9"
				:max-height="maxHeight"
				:max-width="maxWidth"
				:parent-width="parentWidth"
			>
				<AppMediaItemBackdrop
					:class="{ '-backdrop': shouldShowPlaceholder }"
					:media-item="mediaItem"
					radius="lg"
				>
					<template v-if="mediaItem">
						<component
							:is="hasLink && !isEditing ? 'a' : 'div'"
							class="-img-container"
							:href="hasLink && !isEditing ? href : undefined"
							rel="nofollow noopener"
							target="_blank"
						>
							<AppImgResponsive
								v-if="shouldUseMediaserver"
								class="content-image"
								:src="mediaItem.mediaserver_url"
								:alt="title"
								:title="title"
								@load="onImageLoad"
								@click="onItemFullscreen()"
							/>
							<img
								v-else
								class="img-responsive content-image egsdega"
								:src="mediaItem.img_url"
								:alt="title"
								:title="title"
								@load="onImageLoad"
								@click="onItemFullscreen()"
							/>
						</component>
					</template>
					<template v-else-if="hasError">
						<AppTranslate>Error loading media item.</AppTranslate>
					</template>
					<template v-else>
						<AppLoading />
					</template>
				</AppMediaItemBackdrop>
				<div v-if="mediaItem && hasLink" class="-link-overlay">
					<small>
						<AppLinkExternal class="-link-overlay-display" :href="href">
							<AppJolticon class="-icon" icon="link" />
							&nbsp;
							<span>{{ displayHref }}</span>
						</AppLinkExternal>
					</small>
				</div>
			</AppResponsiveDimensions>
			<span v-if="mediaItem && hasCaption" class="text-muted">
				<em>{{ caption }}</em>
			</span>
		</div>
	</AppBaseContentComponent>
</template>

<style lang="stylus" scoped>
.-editing
	// Make sure the X button fits properly, usually not a problem unless the image is super wide.
	min-height: 44px

	.-link-overlay
		change-bg('bg-offset')
		opacity: 0.7
		padding: 2px
		bottom: 4px
		left: 4px

.-link
	// Mobile - styling for coarse pointers
	@media screen and (pointer: coarse)
		margin-bottom: $line-height-computed + 20px !important

.-zoomable
	cursor: zoom-in

// While the image is still loading, we show a dimmed background as a fallback for app-media-item-backdrop
.-backdrop
	change-bg('bg-offset')

// Stretch out the img container so that img-responsive is able to fetch the proper quality item.
.-img-container
	width: 100%

.media-item
	width: 100%
	display: flex
	flex-direction: column
	margin-bottom: $line-height-computed
	cursor: inherit

.media-item-container
	display: flex
	justify-content: center
	align-items: center
	max-width: 100%
	position: relative

	&:hover
		.-link-overlay
			opacity: 1

.-link-overlay
	rounded-corners()
	cursor: pointer
	position: absolute
	padding: 2px
	bottom: -22px
	left: 2px

	&-display
		display: flex

	// Desktop - styling for non-coarse pointers
	@media not screen and (pointer: coarse)
		change-bg('bg-offset')
		transition: opacity 300ms ease
		opacity: 0
		padding: 4px
		bottom: 8px
		left: 8px

.caption-placeholder
	cursor: pointer
	pressy()

.content-image
	display: block
	margin-bottom: 0
	max-width: 100%

// Within lists align media items to the left
li .media-item
	align-items: flex-start !important
</style>
