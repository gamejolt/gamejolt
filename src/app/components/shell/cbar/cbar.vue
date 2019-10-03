<template>
	<div id="shell-cbar" v-if="communities.length">
		<app-scroll-scroller class="-scroller" overlay hide-scrollbar :inview-throttle="0">
			<transition-group name="-items">
				<app-shell-cbar-item
					v-for="community of communities"
					:key="community.id"
					:community="community"
				/>

				<app-shell-cbar-add-item key="add" />
			</transition-group>
		</app-scroll-scroller>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require './common';

#shell-cbar
	change-bg('darkest')
	position: fixed
	width: $shell-cbar-width
	padding: 15px $cbar-h-padding

.-items-move
	transition: transform 0.3s
	transition-timing-function: $ease-out-back

.-scroller
	position: relative
	width: 100%
	height: 100%
</style>

<script lang="ts" src="./cbar"></script>
