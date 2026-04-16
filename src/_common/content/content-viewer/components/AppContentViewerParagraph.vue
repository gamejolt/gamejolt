<script lang="ts" setup>
import { computed } from 'vue';

import { ContentObject } from '../../content-object';
import { useContentOwnerController } from '../../content-owner';
import { renderContentChildren } from './AppContentViewerBaseComponent.vue';

type Props = {
	contentData: ContentObject;
};
const { contentData } = defineProps<Props>();

const { contentRules } = useContentOwnerController()!;

const children = computed(() => renderContentChildren(contentData.content));
</script>

<template>
	<p :style="{ display: contentRules.inlineParagraphs ? 'inline' : undefined }">
		<template v-for="child of children" :key="child">
			<component :is="child" />
		</template>
	</p>
</template>
