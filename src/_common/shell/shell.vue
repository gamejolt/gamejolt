<template>
	<app-scroll-inview-parent>
		<app-theme />
		<app-loading-bar />
		<app-growls />
		<app-modals />

		<slot />
	</app-scroll-inview-parent>
</template>

<script lang="ts" src="./shell"></script>
