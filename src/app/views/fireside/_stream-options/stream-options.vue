<script lang="ts" src="./stream-options"></script>

<template>
	<div class="-options-wrap">
		<app-fireside-settings-popper @show="emitShowPopper" @hide="emitHidePopper">
			<div class="-options">
				<app-jolticon class="-icon" icon="ellipsis-v" />
			</div>
		</app-fireside-settings-popper>
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'
</style>
