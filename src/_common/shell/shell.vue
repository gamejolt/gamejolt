<script lang="ts" src="./shell"></script>

<template>
	<app-lightbox-portal />
	<app-tooltip-portal />

	<app-scroll-inview-parent>
		<slot />

		<app-theme />
		<app-loading-bar />
		<app-growls />
		<app-modals />
	</app-scroll-inview-parent>
</template>
