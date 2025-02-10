<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import AppFadeCollapse from '../../../_common/AppFadeCollapse.vue';
import { ComponentProps } from '../../../_common/component-helpers';
import { ContentRules } from '../../../_common/content/content-rules';
import AppContentViewer from '../../../_common/content/content-viewer/AppContentViewer.vue';
import { FiresidePostModel } from '../../../_common/fireside/post/post-model';
import AppStickerTarget from '../../../_common/sticker/target/AppStickerTarget.vue';
import { StickerTargetController } from '../../../_common/sticker/target/target-controller';
import { PostContentContainerStyles, PostContentLeadStyles } from './post-styles';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePostModel>,
		required: true,
	},
	stickerTargetController: {
		type: Object as PropType<StickerTargetController>,
		required: true,
	},
	truncateLinks: {
		type: Boolean,
	},
	/**
	 * The component we'll use to wrap the content viewer.
	 */
	wrapperComponent: {
		type: [Object, String] as PropType<any>,
		default: undefined,
	},
	wrapperComponentProps: {
		type: Object as PropType<ComponentProps<any>>,
		default: undefined,
	},
});

const { post, stickerTargetController, truncateLinks, wrapperComponent, wrapperComponentProps } =
	toRefs(props);

// For feeds we want to truncate links, the full links can be seen:
// - on the post page
// - when hovering (html title) or on navigation

const isLeadOpen = ref(false);
const canToggleLead = ref(false);

const displayRules = computed(() => new ContentRules({ truncateLinks: truncateLinks.value }));
const overlay = computed(() => !!post.value.background);

const componentProps = computed(
	() =>
		wrapperComponentProps?.value || {
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
