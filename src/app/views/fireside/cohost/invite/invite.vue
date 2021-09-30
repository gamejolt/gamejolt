<script lang="ts" src="./invite"></script>

<template>
	<div class="-options-wrap">
		<div v-app-tooltip="$gettext(`Invite Cohosts`)" class="-options" @click="openInviteModal">
			<app-jolticon class="-icon" icon="add" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../common'
</style>
