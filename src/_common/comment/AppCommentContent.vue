<script lang="ts" setup>
import { PropType, ref } from 'vue';
import AppFadeCollapse from '../AppFadeCollapse.vue';
import AppContentViewer from '../content/content-viewer/AppContentViewer.vue';
import { formatDate } from '../filters/date';
import AppReactionList from '../reaction/list/AppReactionList.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { Comment } from './comment-model';
import './comment.styl';

defineProps({
	comment: {
		type: Object as PropType<Comment>,
		required: true,
	},
	content: {
		type: String,
		default: '',
	},
	canReact: {
		type: Boolean,
	},
});

const canToggleContent = ref(false);
const showFullContent = ref(false);
</script>

<template>
	<div>
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

		<div v-if="comment.reaction_counts.length" class="_reactions-container">
			<AppReactionList
				:model="comment"
				:click-action="canReact ? 'toggle' : undefined"
				context-action="show-details"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-reactions-padding = ($grid-gutter-width / 2) * 0.75
$-reactions-padding-xs = ($grid-gutter-width-xs / 2) * 0.75

.hidden-text-expander
	margin-bottom: $font-size-base

._reactions-container
	padding-bottom: $-reactions-padding-xs

	@media $media-sm-up
		padding-bottom: $-reactions-padding
</style>
