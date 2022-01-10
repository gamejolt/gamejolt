<script lang="ts" src="./countdown"></script>

<template>
	<span
		:style="{
			'font-size': 15 + (11 - displayText.length) + 'px',
		}"
	>
		{{ displayText }}
	</span>
</template>
