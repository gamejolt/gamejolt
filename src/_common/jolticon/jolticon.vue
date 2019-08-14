<template>
	<span
		class="jolticon"
		:class="[
			'jolticon-' + icon,
			big ? 'big' : undefined,
			highlight ? 'highlight' : undefined,
			notice ? 'notice' : undefined,
		]"
	></span>
</template>

<script lang="ts" src="./jolticon"></script>
