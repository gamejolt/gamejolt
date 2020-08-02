<template>
	<div id="shell-cbar" class="theme-dark">
		<app-scroll-scroller v-if="hasCbar" class="-scroller" hide-scrollbar>
			<div class="-inner">
				<app-shell-cbar-controls />

				<transition-group name="-communities">
					<app-shell-cbar-community
						v-for="community of communities"
						:key="community.id"
						class="-community-item"
						:community="community"
					/>
				</transition-group>
				<app-shell-cbar-item>
					<app-community-discover-widget
						tooltip-placement="right"
						@contextmenu.native.prevent
					/>
				</app-shell-cbar-item>
				<app-shell-cbar-item>
					<app-community-add-widget
						tooltip-placement="right"
						@contextmenu.native.prevent
					/>
				</app-shell-cbar-item>
			</div>
		</app-scroll-scroller>
	</div>
</template>

<script lang="ts" src="./cbar"></script>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import './variables'

#shell-cbar
	change-bg('darkest')
	position: fixed
	width: $shell-cbar-width
	z-index: $zindex-cbar
	transform: translateX((-($shell-cbar-width)))
	transition: transform 300ms $weak-ease-out

.-community-item
	transition: transform 300ms $ease-out-back, opacity 150ms

.-communities
	&-enter
	&-leave-to
		opacity: 0
		transform: translateY(-15px)

	&-leave-active
		position: absolute

.-scroller
	position: relative
	width: 100%
	height: 100%

.-inner
	padding: 15px $cbar-h-padding
</style>
