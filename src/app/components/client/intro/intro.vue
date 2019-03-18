<template>
	<div
		class="client-intro"
		:class="{
			'-leave': shouldTransitionOut,
		}"
		@transitionend="leaveAnimFinished"
	>
		<div class="-wrap">
			<img
				v-if="shouldShowLogo"
				class="-logo"
				src="./intro.gif"
				width="328"
				height="36"
				alt="Game Jolt"
			/>
		</div>
		<app-expand :when="shouldShowLoading">
			<br />
			<app-loading centered />
		</app-expand>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.client-intro
	theme-prop('background-color', 'darkest')
	position: fixed
	top: 0
	right: 0
	bottom: 0
	left: 0
	z-index: 100000
	display: flex
	align-items: center
	justify-content: center
	flex-direction: column

	&.-leave
		theme-prop('background-color', 'darkest-trans')
		transition: all 500ms
		pointer-events: none

		.-wrap
			transition: all 500ms $strong-ease-out
			opacity: 0
			transform: scale(2)

		.loading
			opacity: 0

.-logo
	display: inline-block
	margin: 0 4px
</style>

<script lang="ts" src="./intro" />
