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
</script>

<template>
	<blockquote>
		<template v-for="child of children" :key="child">
			<component :is="child" />
		</template>
	</blockquote>
</template>
