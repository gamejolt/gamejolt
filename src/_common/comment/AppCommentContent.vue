<script lang="ts" setup>
import { PropType, ref } from 'vue';
import AppFadeCollapse from '../AppFadeCollapse.vue';
import AppContentViewer from '../content/content-viewer/content-viewer.vue';
import { formatDate } from '../filters/date';
import AppStickerControlsOverlay from '../sticker/AppStickerControlsOverlay.vue';
import AppStickerReactions from '../sticker/reactions/reactions.vue';
import { createStickerTargetController } from '../sticker/target/target-controller';
import AppStickerTarget from '../sticker/target/target.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { Comment } from './comment-model';
import './comment.styl';

const props = defineProps({
	comment: {
		type: Object as PropType<Comment>,
		required: true,
	},
	content: {
		type: String,
		default: '',
	},
	canPlaceStickers: {
		type: Boolean,
	},
});

const stickerTargetController = createStickerTargetController(props.comment);

const canToggleContent = ref(false);
const showFullContent = ref(false);
</script>

<template>
	<div>
		<AppStickerTarget :controller="stickerTargetController" :disabled="!canPlaceStickers">
			<AppFadeCollapse
				:collapse-height="375"
				:is-open="showFullContent"
				@require-change="canToggleContent = $event"
				@expand="showFullContent = true"
			>
				<AppContentViewer :source="content" />

				<p v-if="comment.modified_on" class="text-muted small">
					<b><AppTranslate>Last modified on</AppTranslate></b>
					{{ ' ' }}
					<span :title="formatDate(comment.modified_on, 'medium')">
						{{ formatDate(comment.modified_on, 'longDate') }}
					</span>
				</p>
			</AppFadeCollapse>

			<a
				v-if="canToggleContent"
				v-app-track-event="`comment-widget:toggle-full-content`"
				class="hidden-text-expander"
				@click="showFullContent = !showFullContent"
			/>
		</AppStickerTarget>

		<AppStickerControlsOverlay
			v-if="comment.sticker_counts.length"
			class="-reactions-container"
		>
			<AppStickerReactions :controller="stickerTargetController" />
		</AppStickerControlsOverlay>
	</div>
</template>

<style lang="stylus" scoped>
$-reactions-padding = ($grid-gutter-width / 2) * 0.75
$-reactions-padding-xs = ($grid-gutter-width-xs / 2) * 0.75

.hidden-text-expander
	margin-bottom: $font-size-base

.-reactions-container
	padding-bottom: $-reactions-padding-xs

	@media $media-sm-up
		padding-bottom: $-reactions-padding
</style>
