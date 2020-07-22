<template>
	<div id="shell-sidebar-context" class="fill-offset" thin>
		<component :is="sidebarComponent" v-bind="sidebarProps" />
	</div>
</template>

<script lang="ts" src="./context"></script>

<style lang="stylus" scoped>
@import '~styles/variables'

#shell-sidebar-context
	padding: $shell-content-sidebar-padding
</style>
