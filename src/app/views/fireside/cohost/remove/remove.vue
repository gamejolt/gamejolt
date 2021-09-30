<script lang="ts" src="./remove"></script>

<template>
	<div class="-options-wrap">
		<div v-app-tooltip="$gettext(`Remove Cohosts`)" class="-options" @click="openRemoveModal">
			<app-jolticon class="-icon" icon="remove" notice />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../common'
</style>
