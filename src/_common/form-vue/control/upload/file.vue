<template>
	<input
		:id="id"
		:name="name"
		type="file"
		@change="onChange"
		:accept="accept"
		:multiple="multiple ? 'multiple' : undefined"
	/>
</template>

<script lang="ts" src="./file"></script>
