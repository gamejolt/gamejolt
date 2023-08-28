<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { arrayShuffle } from '../../../../utils/array';
import { showErrorGrowl } from '../../../growls/growls.service';
import AppJolticon from '../../../jolticon/AppJolticon.vue';
import AppLoading from '../../../loading/AppLoading.vue';
import AppTranslate from '../../../translate/AppTranslate.vue';
import { $gettext } from '../../../translate/translate.service';
import AppVideoEmbed from '../../../video/embed/AppVideoEmbed.vue';
import { ContentEmbedService } from '../../content-editor/content-embed.service';
import { defineEditableNodeViewProps } from '../../content-editor/node-views/base';
import { useContentOwnerController } from '../../content-owner';
import AppBaseContentComponent from '../AppBaseContentComponent.vue';
import AppContentEmbedSketchfab from './AppContentEmbedSketchfab.vue';
import AppContentEmbedSoundcloud from './AppContentEmbedSoundcloud.vue';

const props = defineProps({
	type: {
		type: String,
		required: true,
	},
	source: {
		type: String,
		required: true,
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

const loading = ref(false);
const previewEmbeds = ref<any[]>([]);

const inputElement = ref<HTMLInputElement>();
const hasContent = computed(() => props.type && props.source);
const hasMoreEmbedPreviews = computed(
	() => previewEmbeds.value.length < ContentEmbedService.previewSources.length
);

onMounted(() => {
	// If the placeholder input is available, focus it immediately
	inputElement.value?.focus();

	setRandomEmbedPills();
});

function setRandomEmbedPills() {
	previewEmbeds.value = arrayShuffle(ContentEmbedService.previewSources).slice(0, 3);
}

function onInput(e: Event) {
	if (e.target instanceof HTMLInputElement) {
		props.onUpdateAttrs?.({ source: e.target.value });
	}
}

async function onKeydown(e: KeyboardEvent) {
	const _elem = inputElement.value;
	if (!_elem) {
		return;
	}

	switch (e.key) {
		case 'Backspace':
			// remove this node if backspace was pressed at the start of the input element.
			if (_elem.selectionStart === 0 && _elem.selectionEnd === 0) {
				props.onRemoved?.();
				e.preventDefault();
			}
			break;

		case 'Enter':
			if (_elem.value.length === 0) {
				props.onRemoved?.();
			} else {
				loading.value = true;
				const data = await ContentEmbedService.getEmbedData(owner, _elem.value);
				if (data !== undefined) {
					props.onUpdateAttrs?.(data);
				} else {
					showErrorGrowl({
						title: $gettext(`Uh oh`),
						message: $gettext(
							`Something went wrong embedding your content. Maybe try again with a different link?`
						),
					});
				}
				loading.value = false;
			}
			e.preventDefault();
			break;

		case 'Escape':
			props.onRemoved?.();
			e.preventDefault();
			break;
	}
}
</script>

<template>
	<AppBaseContentComponent
		v-if="hasContent"
		class="embed-main"
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		@removed="props.onRemoved?.()"
	>
		<div class="embed-container">
			<div v-if="isEditing" class="embed-overlay-img" />
			<AppVideoEmbed
				v-if="type === 'youtube-video'"
				video-provider="youtube"
				:video-id="source"
			/>
			<AppContentEmbedSoundcloud v-else-if="type === 'soundcloud-song'" :track-id="source" />
			<AppContentEmbedSketchfab v-else-if="type === 'sketchfab-model'" :model-id="source" />
		</div>
	</AppBaseContentComponent>
	<div v-else contenteditable="false" class="input-container">
		<div class="embed-pill-container">
			<span class="help-inline"><AppTranslate>We support</AppTranslate></span>
			<span v-for="preview of previewEmbeds" :key="preview.name" class="embed-pill">
				<AppJolticon
					:icon="preview.icon"
					class="embed-pill-icon"
					:style="{ color: '#' + preview.color }"
				/>
				{{ preview.name }}
			</span>
			<span
				v-if="hasMoreEmbedPreviews"
				class="embed-pill embed-pill-more"
				@click.prevent="setRandomEmbedPills"
			>
				<AppJolticon icon="ellipsis-h" class="embed-pill-icon embed-pill-icon-more" />
				<AppTranslate>More</AppTranslate>
			</span>
		</div>
		<input
			ref="inputElement"
			class="-input"
			type="text"
			:value="source"
			:disabled="loading || isDisabled ? 'true' : undefined"
			:placeholder="$gettext(`Paste a link to what you want to embed`)"
			@input="onInput"
			@keydown="onKeydown"
		/>
		<div v-if="loading" class="input-overlay">
			<AppLoading hide-label />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.embed-main
	margin-bottom: $line-height-computed

.embed-container
	position: relative
	width: 100%
	rounded-corners-lg()
	overflow: hidden
	cursor: default

	& > div
		margin-left: auto
		margin-right: auto

.embed-overlay-img
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	background-image: url('./shell-bg.png')
	background-repeat: repeat
	z-index: 6
	mask-image: radial-gradient(rgba(0, 0, 0, 0.3) 0, rgba(0, 0, 0, 0.5) 3%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0.85) 80%)

.input-container
	position: relative
	white-space: normal
	margin-bottom: 10px
	cursor: default

.-input
	background-color: transparent
	border-width: 0
	width: 100%
	font-size: $font-size-large
	margin-top: 4px

.input-overlay
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	background-color: rgba(0, 0, 0, 0.5)
	display: flex
	justify-content: center
	rounded-corners-lg()

.embed-pill-container
	& > span
	a
		margin-right: 8px

.embed-pill
	rounded-corners-sm()
	display: inline-flex
	align-items: center
	font-size: $font-size-tiny
	padding-top: 4px
	opacity: 0.8
	theme-prop('color', 'fg', true)

.embed-pill-icon
	padding-right: 2px

.embed-pill-more
	theme-prop('border-color', 'light')
	theme-prop('color', 'light', true)

.embed-pill-icon-more
	theme-prop('color', 'light')
</style>
