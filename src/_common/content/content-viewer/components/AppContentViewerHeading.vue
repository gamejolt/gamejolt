<script lang="ts" setup>
import { PropType, computed } from 'vue';
import { ContentObject } from '../../content-object';
import { renderContentChildren } from './AppContentViewerBaseComponent.vue';

const props = defineProps({
	contentData: {
		type: Object as PropType<ContentObject>,
		required: true,
	},
});

const children = computed(() => renderContentChildren(props.contentData.content));

// We do this because we want users to only be able to add H3s and H4s (SEO).
const tag = computed(() => `h${props.contentData.attrs.level + 2}`);
</script>

<template>
	<component :is="tag">
		<template v-for="child of children" :key="child">
			<component :is="child" />
		</template>
	</component>
</template>
