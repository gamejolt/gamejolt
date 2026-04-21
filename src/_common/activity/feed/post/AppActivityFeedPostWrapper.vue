<script lang="ts" setup>
import { computed, HTMLAttributes } from 'vue';

import { useOnHover } from '~common/on/useOnHover';

defineProps</* @vue-ignore */ Pick<HTMLAttributes, 'onClick'>>();
import { stylePostFeedItem } from '~common/post/post-styles';

/**
 * This is mostly for performance so that it only has to re-render this single
 * component for hover styling.
 */

const { hoverBinding, hovered } = useOnHover();
const itemStyles = computed(() => stylePostFeedItem({ isHovered: hovered }));
</script>

<template>
	<div v-bind="hoverBinding" :style="itemStyles">
		<slot />
	</div>
</template>
