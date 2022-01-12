<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppContentViewer from '../../content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../fade-collapse/fade-collapse.vue';
import { formatDate } from '../../filters/date';
import AppStickerControlsOverlay from '../../sticker/controls-overlay/controls-overlay.vue';
import AppStickerReactions from '../../sticker/reactions/reactions.vue';
import {
	createStickerTargetController,
	StickerTargetController,
} from '../../sticker/target/target-controller';
import AppStickerTarget from '../../sticker/target/target.vue';
import { Comment } from '../comment-model';
import '../comment.styl';

@Options({
	components: {
		AppFadeCollapse,
		AppContentViewer,
		AppStickerTarget,
		AppStickerReactions,
		AppStickerControlsOverlay,
	},
})
export default class AppCommentContent extends Vue {
	@Prop({ type: Object, required: true }) comment!: Comment;
	@Prop({ type: String, default: '' }) content!: string;
	@Prop({ type: Boolean, default: false }) canPlaceStickers!: boolean;

	stickerTargetController!: StickerTargetController;

	canToggleContent = false;
	showFullContent = false;

	readonly formatDate = formatDate;

	created() {
		this.stickerTargetController = createStickerTargetController(this.comment);
	}
}
</script>

<template>
	<div>
		<app-sticker-target :controller="stickerTargetController" :disabled="!canPlaceStickers">
			<app-fade-collapse
				:collapse-height="375"
				:is-open="showFullContent"
				@require-change="canToggleContent = $event"
				@expand="showFullContent = true"
			>
				<app-content-viewer :source="content" />

				<p v-if="comment.modified_on" class="text-muted small">
					<b><translate>Last modified on</translate></b>
					<span :title="formatDate(comment.modified_on, 'medium')">
						{{ formatDate(comment.modified_on, 'longDate') }}
					</span>
				</p>
			</app-fade-collapse>

			<a
				v-if="canToggleContent"
				v-app-track-event="`comment-widget:toggle-full-content`"
				class="hidden-text-expander"
				@click="showFullContent = !showFullContent"
			/>
		</app-sticker-target>

		<app-sticker-controls-overlay
			v-if="comment.sticker_counts.length"
			class="-reactions-container"
		>
			<app-sticker-reactions :controller="stickerTargetController" />
		</app-sticker-controls-overlay>
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
