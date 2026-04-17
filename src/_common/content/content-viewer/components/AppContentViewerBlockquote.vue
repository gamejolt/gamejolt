<script lang="ts" setup>
import { computed } from 'vue';

import { ContentObject } from '~common/content/content-object';
import { renderContentChildren } from '~common/content/content-viewer/components/AppContentViewerBaseComponent.vue';

type Props = {
	contentData: ContentObject;
};
const { contentData } = defineProps<Props>();

const children = computed(() => renderContentChildren(contentData.content));
</script>

<template>
	<blockquote>
		<template v-for="child of children" :key="child">
			<component :is="child" />
		</template>
	</blockquote>
</template>
