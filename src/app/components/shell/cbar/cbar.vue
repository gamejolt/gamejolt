<template>
	<div id="shell-cbar" v-if="shouldShow">
		<app-scroll-scroller class="-scroller" overlay hide-scrollbar>
			<div class="-inner">
				<transition-group name="-items">
					<app-shell-cbar-item
						v-for="community of communities"
						:key="community.id"
						:community="community"
					/>

					<app-shell-cbar-add-item key="add" />
				</transition-group>
			</div>
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

.-items-move
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
