<template>
	<router-link :to="{ name: 'weplay' }">
		<div class="weplay-banner well fill-offset full-bleed-xs">
			<div class="banner-lead">
				<app-jolticon icon="game" big />
				<p class="lead">
					Check out
					<strong>Game Jolt WePlay</strong>
				</p>
			</div>

			<div class="banner-help help-block">
				The new and innovative way to play games, right here on Game Jolt!
			</div>

			<div v-if="!Screen.isXs" class="mascots">
				<img class="img-responsive" src="./mascots.svg" alt="" />
			</div>
		</div>
	</router-link>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.weplay-banner
	position: relative
	border-style: solid
	border-width: 2px
	rounded-corners()
	theme-prop('border-color', 'bg-offset')
	overflow: hidden

.weplay-banner:hover
	theme-prop('border-color', 'highlight')

.banner-lead
	display: flex

.lead
	margin-left: 10px

.banner-help
	max-width: 300px

.mascots
	position: absolute
	top: -20px
	right: -20px
	width: 300px
	opacity: 0.5

</style>

<script lang="ts" src="./banner" />
