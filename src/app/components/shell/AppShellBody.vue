<script lang="ts" setup>
import { useAppStore } from '../../store';

const { hasContentSidebar } = useAppStore();
</script>

<template>
	<div id="shell-body" :class="{ 'has-content-sidebar': hasContentSidebar }">
		<div class="shell-body-main">
			<slot />
		</div>
	</div>
</template>

<!-- Global -->
<style lang="stylus">
#shell-body
	position: relative
	background-color: transparent
	z-index: $zindex-shell-body
	overflow: hidden
	min-height: 100vh

	.container
		width: 100%
		max-width: $container-lg

// Set the content BG so that we don't show the html color.
#content
	change-bg('bg')
	theme-prop('color', 'fg')

.shell-body-main
	background-color: $white
</style>
