<script lang="ts" setup>
import '~common/comment/comment.styl';

import { ref } from 'vue';

import AppFadeCollapse from '~common/AppFadeCollapse.vue';
import { CommentModel } from '~common/comment/comment-model';
import AppContentViewer from '~common/content/content-viewer/AppContentViewer.vue';
import { isDynamicGoogleBot } from '~common/device/device.service';
import { formatDate } from '~common/filters/date';
import AppReactionList from '~common/reaction/list/AppReactionList.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { kFontSizeBase } from '~styles/variables';

type Props = {
	comment: CommentModel;
	content?: string;
	canReact?: boolean;
};
const { comment, content = '', canReact } = defineProps<Props>();

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
			class="hidden-text-expander"
			:style="{
				marginBottom: kFontSizeBase.px,
			}"
			@click="showFullContent = !showFullContent"
		/>

		<div
			v-if="comment.reaction_counts.length && !isDynamicGoogleBot()"
			class="_reactions-container"
		>
			<AppReactionList
				:model="comment"
				:click-action="canReact ? 'toggle' : undefined"
				context-action="show-details"
				sans-margin-bottom
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-reactions-padding = ($grid-gutter-width / 2) * 0.75
$-reactions-padding-xs = ($grid-gutter-width-xs / 2) * 0.75

._reactions-container
	padding-bottom: $-reactions-padding-xs

	@media $media-sm-up
		padding-bottom: $-reactions-padding
</style>
