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

const children = computed(() => renderChildren(contentData.value.content));
</script>

<template>
	<p :class="{ '-inline': owner.contentRules.inlineParagraphs }">
		<template v-for="child in children" :key="child">
			<component :is="child" />
		</template>
	</p>
</template>

<style lang="stylus" scoped>
.-inline
	display: inline
</style>
