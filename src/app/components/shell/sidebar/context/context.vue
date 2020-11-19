<script lang="ts" src="./context"></script>

<template>
	<div id="shell-sidebar-context">
		<component
			:is="activeContextPane.component"
			v-if="activeContextPane"
			v-bind="activeContextPane.props"
		/>
	</div>
</template>
