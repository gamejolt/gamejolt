<script lang="ts" setup>
import { computed, ref } from 'vue';

import AppFadeCollapse from '~common/AppFadeCollapse.vue';
import { ComponentProps } from '~common/component-helpers';
import { ContentRules } from '~common/content/content-rules';
import AppContentViewer from '~common/content/content-viewer/AppContentViewer.vue';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { PostContentContainerStyles, PostContentLeadStyles } from '~common/post/post-styles';
import AppStickerTarget from '~common/sticker/target/AppStickerTarget.vue';
import { StickerTargetController } from '~common/sticker/target/target-controller';

type Props = {
	post: FiresidePostModel;
	stickerTargetController: StickerTargetController;
	truncateLinks?: boolean;
	/**
	 * The component we'll use to wrap the content viewer.
	 */
	wrapperComponent?: any;
	wrapperComponentProps?: ComponentProps<any>;
};
const { post, stickerTargetController, truncateLinks, wrapperComponent, wrapperComponentProps } =
	defineProps<Props>();

// For feeds we want to truncate links, the full links can be seen:
// - on the post page
// - when hovering (html title) or on navigation

const isLeadOpen = ref(false);
const canToggleLead = ref(false);

const displayRules = computed(() => new ContentRules({ truncateLinks }));
const overlay = computed(() => !!post.background);

const componentProps = computed(
	() =>
		wrapperComponentProps || {
			collapseHeight: 400,
			isOpen: isLeadOpen.value,
			animate: false,
		}
);

function canToggleLeadChanged(canToggle: boolean) {
	canToggleLead.value = canToggle;
}

function toggleLead() {
	isLeadOpen.value = !isLeadOpen.value;
}
</script>

<template>
	<div :style="PostContentContainerStyles(overlay)">
		<AppStickerTarget :controller="stickerTargetController" :disabled="!post.canPlaceSticker">
			<slot name="content">
				<!--
				This shouldn't ever really show a collapser. It's for the
				jokers that think it would be fun to make a post with a
				bunch of new lines.
				-->
				<component
					:is="wrapperComponent || AppFadeCollapse"
					v-bind="componentProps"
					@require-change="canToggleLeadChanged"
				>
					<div :style="PostContentLeadStyles">
						<AppContentViewer
							:source="post.lead_content"
							:display-rules="displayRules"
						/>
					</div>
				</component>
			</slot>
		</AppStickerTarget>

		<a v-if="canToggleLead" class="hidden-text-expander" @click="toggleLead()" />

		<slot />
	</div>
</template>
