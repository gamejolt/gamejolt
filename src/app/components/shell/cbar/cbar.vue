<template>
	<div id="shell-cbar" v-if="communities.length">
		<transition-group name="-items">
			<app-shell-cbar-item
				v-for="community of communities"
				:key="community.id"
				:community="community"
			/>
		</transition-group>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

#shell-cbar
	theme-prop('background-color', 'darkest')
	position: fixed
	width: $shell-cbar-width
	padding: 15px $cbar-h-padding

.-items-move
	transition: transform 0.3s
	transition-timing-function: $ease-out-back
</style>

<script lang="ts" src="./cbar"></script>
