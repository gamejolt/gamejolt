<template>
	<a :href="url" target="_blank" @click.capture="onClick($event)">
		<slot />
	</a>
</template>

<script lang="ts" src="./help"></script>
