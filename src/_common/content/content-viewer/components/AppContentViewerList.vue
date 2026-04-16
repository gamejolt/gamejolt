<script lang="ts" setup>
import { computed } from 'vue';

import { ContentObject } from '../../content-object';
import { renderContentChildren } from './AppContentViewerBaseComponent.vue';

type Props = {
	contentData: ContentObject;
};
const { contentData } = defineProps<Props>();

const children = computed(() => renderContentChildren(contentData.content));
</script>

<template>
	<component :is="contentData.type === 'orderedList' ? 'ol' : 'ul'">
		<template v-for="child of children" :key="child">
			<component :is="child" />
		</template>
	</component>
</template>
