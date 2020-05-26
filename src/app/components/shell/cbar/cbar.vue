<template>
	<div id="shell-cbar">
		<app-scroll-scroller class="-scroller" hide-scrollbar>
			<div class="-inner">
				<app-shell-cbar-item>
					<app-jolticon icon="gamejolt" />
				</app-shell-cbar-item>
				<transition-group name="-communities">
					<app-shell-cbar-community
						v-for="community of communities"
						:key="community.id"
						:community="community"
					/>
				</transition-group>
				<app-shell-cbar-item>
					<app-community-discover-widget tooltip-placement="right" @contextmenu.native.prevent />
				</app-shell-cbar-item>
				<app-shell-cbar-item>
					<app-community-add-widget tooltip-placement="right" @contextmenu.native.prevent />
				</app-shell-cbar-item>
			</div>
		</app-scroll-scroller>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require './variables'

#shell-cbar
	change-bg('darkest')
	position: fixed
	width: $shell-cbar-width

.-communities-move
	transition: transform 0.3s
	transition-timing-function: $ease-out-back

.-scroller
	position: relative
	width: 100%
	height: 100%

.-inner
	padding: 15px $cbar-h-padding
</style>

<script lang="ts" src="./cbar"></script>
