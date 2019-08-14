<template>
	<form :name="name" novalidate @submit.prevent="submit">
		<!--
		We show a loader before we load it ever. After the initial load we just
		do the loading fade so that the form doesn't completely disappear when
		loading subsequent.
	-->
		<app-loading v-if="!isLoadedBootstrapped" />
		<app-loading-fade v-else :is-loading="!isLoaded">
			<slot />
		</app-loading-fade>
	</form>
</template>

<script lang="ts" src="./form"></script>
