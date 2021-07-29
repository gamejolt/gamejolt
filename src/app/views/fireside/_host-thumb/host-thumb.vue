<script lang="ts" src="./host-thumb"></script>

<template>
	<div class="-thumb" @click="onClick">
		<div class="-display-thumb" :class="{ '-hidden': !hasDisplay }" />

		<div
			class="-avatar-wrap"
			:class="{ '-full': !hasDisplay }"
			:style="{ 'border-width': talking * 5 + 'px' }"
		>
			<div class="-avatar">
				<template v-if="host.userModel">
					<app-user-avatar-img :user="host.userModel" />
				</template>
			</div>
		</div>
		<div class="-spacer" />
		<div class="-active-indicator" :class="{ '-active': isFocused }" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-thumb
	display: flex
	flex-direction: column
	align-items: center
	cursor: pointer
	user-select: none

.-display-thumb
	rounded-corners()
	flex: auto
	width: 100%
	background-color: var(--theme-bg-subtle)
	transition: opacity 250ms

	&.-hidden
		opacity: 0

.-avatar-wrap
	position: absolute
	width: 50px
	height: 50px
	bottom: 30px - (@width / 2)
	border-radius: 50%
	border-style: solid
	border-color: var(--theme-highlight)
	transition: border-width 100ms cubic-bezier(0.39, 0.58, 0.57, 1)
	will-change: border-width
	overflow: hidden
	transition: all 250ms $strong-ease-out

	&.-full
		width: 86px
		height: 86px
		bottom: 12px

.-avatar
	background-color: var(--theme-bg-offset)
	color: var(--theme-fg)
	display: flex
	justify-content: center
	align-items: center

.-spacer
	flex: none
	height: 30px

.-active-indicator
	flex: none
	border-radius: 40%
	height: 4px
	width: 0
	opacity: 0
	background-color: var(--theme-link)
	transition: width 400ms $ease-out-back, opacity 250ms

	&.-active
		width: 30px
		opacity: 1
</style>
