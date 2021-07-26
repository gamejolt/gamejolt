<script lang="ts" src="./new-button"></script>

<template>
	<p>
		<app-button outline primary block @click="emitClick">
			<slot />
		</app-button>
	</p>
</template>
