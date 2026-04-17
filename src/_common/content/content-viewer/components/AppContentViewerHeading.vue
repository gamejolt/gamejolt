<script lang="ts" setup>
import { computed } from 'vue';

import { ContentObject } from '~common/content/content-object';
import { renderContentChildren } from '~common/content/content-viewer/components/AppContentViewerBaseComponent.vue';

type Props = {
	contentData: ContentObject;
};
const { contentData } = defineProps<Props>();

const children = computed(() => renderContentChildren(contentData.content));

// We do this because we want users to only be able to add H3s and H4s (SEO).
const tag = computed(() => `h${contentData.attrs.level + 2}`);
</script>

<template>
	<component :is="tag">
		<template v-for="child of children" :key="child">
			<component :is="child" />
		</template>
	</component>
</template>
