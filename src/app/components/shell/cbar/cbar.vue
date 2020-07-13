<template>
	<div id="shell-cbar" class="theme-dark">
		<app-scroll-scroller v-if="hasCbar" class="-scroller" hide-scrollbar>
			<div class="-inner">
				<app-shell-cbar-controls />

				<!-- JODO:
						Need to change the way we toggle channels context pane for Sm and Md breakpoints.
						We should be able to click on the cbar item (community bubble) a second time to open
						the context pane.
				 -->
				<transition-group name="-communities">
					<app-shell-cbar-community
						v-for="community of communities"
						:key="community.id"
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

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require './variables'

#shell-cbar
	change-bg('darkest')
	position: fixed
	width: $shell-cbar-width
	z-index: $zindex-cbar
	transform: translateX(-($shell-cbar-width))
	transition: transform 300ms $weak-ease-out

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
