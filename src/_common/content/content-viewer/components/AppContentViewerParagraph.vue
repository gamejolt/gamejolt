<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { ContentObject } from '../../content-object';
import { useContentOwnerController } from '../../content-owner';
import { renderChildren } from './AppContentViewerBaseComponent.vue';

const props = defineProps({
	contentData: {
		type: Object as PropType<ContentObject>,
		required: true,
	},
});

const { contentData } = toRefs(props);

const owner = useContentOwnerController()!;

const rootComponent = computed(() => (owner.contentRules.inlineParagraphs ? 'span' : 'p'));
const children = computed(() => renderChildren(contentData.value.content));
</script>

<template>
	<component :is="rootComponent">
		<template v-for="child in children" :key="child">
			<component :is="child" />
		</template>
	</component>
</template>
