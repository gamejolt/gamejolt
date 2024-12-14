<script lang="ts" setup>
import { useAdStore } from './ad-store';

const { hasTakeover } = useAdStore();

// Keep it in DOM if it's hidden since we need to teleport to this, and I don't
// want to have any timing issues with v-if.
</script>

<template>
	<div
		id="ad-takeover-background"
		:style="
			hasTakeover
				? {
						position: `fixed`,
						width: `100%`,
						height: `100%`,
						zIndex: `0`,
				  }
				: {
						display: `none`,
				  }
		"
	/>
</template>
