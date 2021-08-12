<script lang="ts" src="./share-options"></script>

<template>
	<div v-if="!isDraft" class="-options-wrap">
		<div v-app-tooltip="$gettext(`Share Link`)" class="-options" @click="onClickShare()">
			<app-jolticon class="-icon" icon="share-airplane" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'
</style>
