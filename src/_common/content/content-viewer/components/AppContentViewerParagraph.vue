<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { ContentObject } from '../../content-object';
import { useContentOwnerController } from '../../content-owner';
import { renderContentChildren } from './AppContentViewerBaseComponent.vue';

const props = defineProps({
	contentData: {
		type: Object as PropType<ContentObject>,
		required: true,
	},
});

const { contentRules } = useContentOwnerController()!;

const children = computed(() => renderContentChildren(props.contentData.content));
</script>

<template>
	<p :style="{ display: contentRules.inlineParagraphs ? 'inline' : undefined }">
		<template v-for="child of children" :key="child">
			<component :is="child" />
		</template>
	</p>
</template>
