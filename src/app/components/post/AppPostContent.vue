<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import AppFadeCollapse from '../../../_common/AppFadeCollapse.vue';
import { ContentRules } from '../../../_common/content/content-editor/content-rules';
import AppContentViewer from '../../../_common/content/content-viewer/AppContentViewer.vue';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import AppStickerTarget from '../../../_common/sticker/target/AppStickerTarget.vue';
import { StickerTargetController } from '../../../_common/sticker/target/target-controller';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
	stickerTargetController: {
		type: Object as PropType<StickerTargetController>,
		required: true,
	},
	truncateLinks: {
		type: Boolean,
	},
});

const { truncateLinks, post } = toRefs(props);

// For feeds we want to truncate links, the full links can be seen:
// - on the post page
// - when hovering (html title) or on navigation

const isLeadOpen = ref(false);
const canToggleLead = ref(false);

const displayRules = computed(() => new ContentRules({ truncateLinks: truncateLinks.value }));
const overlay = computed(() => !!post.value.background);

function canToggleLeadChanged(canToggle: boolean) {
	canToggleLead.value = canToggle;
}

function toggleLead() {
	isLeadOpen.value = !isLeadOpen.value;
}
</script>

<template>
	<div class="-container-theme">
		<div :class="{ '-overlay-post-lead': overlay }">
			<AppStickerTarget
				:controller="stickerTargetController"
				:disabled="!post.canPlaceSticker"
			>
				<!--
					This shouldn't ever really show a collapser. It's for the
					jokers that think it would be fun to make a post with a
					bunch of new lines.
				-->
				<AppFadeCollapse
					:collapse-height="400"
					:is-open="isLeadOpen"
					:animate="false"
					@require-change="canToggleLeadChanged"
				>
					<AppContentViewer
						class="fireside-post-lead"
						:source="post.lead_content"
						:display-rules="displayRules"
					/>
				</AppFadeCollapse>
			</AppStickerTarget>

			<a v-if="canToggleLead" class="hidden-text-expander" @click="toggleLead()" />

			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

.fireside-post-lead
	margin-top: $-item-padding-xs-v

	@media $media-sm-up
		margin-top: $-item-padding-v

.-manage
.fireside-post-lead
	margin-bottom: $-item-padding-xs-v

	@media $media-sm-up
		margin-bottom: $-item-padding-v

.-communities
	white-space: nowrap

.-container-theme
	--overlay-lead-padding: ($-item-padding-xs / 2)

	@media $media-md-up
		--overlay-lead-padding: ($-item-padding / 2)

.-overlay-post-lead
	rounded-corners-lg()
	change-bg('bg')
	elevate-1()
	overflow: hidden
	padding: 0 var(--overlay-lead-padding)
	margin: var(--overlay-lead-padding) 0
</style>
