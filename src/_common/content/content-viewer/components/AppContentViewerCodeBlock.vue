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
	<pre class="content-viewer-code-block">
		<template v-for="child of children" :key="child">
			<component :is="child" />
		</template>
	</pre>
</template>

<style lang="stylus" scoped>
// Override code styling to always have the default code block background color
.content-viewer-code-block
	change-bg('darkest', true)
	position: relative
	font-size: $font-size-small !important
	border-radius: $border-radius-large !important
	white-space: pre-wrap

	& *::selection
		theme-prop('background', 'gray', true)

	&:before
		content: attr(data-annotation)
		position: absolute
		top: 4px
		right: 10px
		font-size: $font-size-small
		font-style: italic

	& > code
		display: inline-block
		margin-top: 4px

	& .tag // Reset due to .tag class interference
		all: initial
		font-family: inherit
		font-size: inherit
</style>
