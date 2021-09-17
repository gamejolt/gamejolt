<script lang="ts" src="./placeholder"></script>

<template>
	<div class="fireside-avatar">
		<div class="-header">
			<div class="-avatar">
				<div class="-avatar-inner">
					<div class="-avatar-img -subtle" />
				</div>
			</div>

			<div class="-tag -subtle">
				<translate>CHAT</translate>
			</div>
		</div>

		<div class="-title" />
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

.-tag
	elevate-0()

	> *
		visibility: hidden

.-title
	lazy-placeholder-block()
	width: 80%

.-subtle
	background-color: var(--theme-bg-subtle)
	border-color: var(--theme-bg-subtle)
</style>
