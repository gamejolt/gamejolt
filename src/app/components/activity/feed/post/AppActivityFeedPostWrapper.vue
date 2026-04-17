<script lang="ts" setup>
import { computed, HTMLAttributes } from 'vue';

import { useOnHover } from '~common/on/useOnHover';
import { Screen } from '~common/screen/screen-service';

defineProps</* @vue-ignore */ Pick<HTMLAttributes, 'onClick'>>();
import { stylePostFeedItem } from '~app/components/post/post-styles';

/**
 * This is mostly for performance so that it only has to re-render this single
 * component for hover styling.
 */

const { hoverBinding, hovered } = useOnHover();
const itemStyles = computed(() => stylePostFeedItem({ isHovered: hovered }));
</script>

<template>
	<div
		v-bind="hoverBinding"
		:class="['change-bg-bg', { 'rounded-lg': !Screen.isXs }]"
		:style="itemStyles"
	>
		<slot />
	</div>
</template>
