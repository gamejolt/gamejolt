<script lang="ts" src="./manage"></script>

<template>
	<div class="-options-wrap">
		<div v-app-tooltip="$gettext('Manage Cohosts')" class="-options" @click="openManageModal">
			<app-jolticon class="-icon" icon="users" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../common'
</style>
