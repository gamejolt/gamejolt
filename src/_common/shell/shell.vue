<template>
	<app-scroll-inview-parent>
		<slot />

		<app-theme />
		<app-loading-bar />
		<app-growls />
		<app-modals />
	</app-scroll-inview-parent>
</template>

<script lang="ts" src="./shell"></script>
