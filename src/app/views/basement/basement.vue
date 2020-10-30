<script lang="ts" src="./basement"></script>

<template>
	<div class="theme-dark">
		<app-flashlight />

		<section v-if="isRouteBootstrapped" class="section fill-backdrop">
			<div class="container">
				<div class="-page">
					<template v-if="!level">
						<p class="lead">
							Nothing seems to be here... It's just an empty basement.
						</p>
					</template>
					<template v-else>
						<p class="lead anim-fade-in-down">
							In the darkness of the Game Jolt Basement, a monster is lurking. It
							seems to <em>really</em> like candy and keeps stealing all your treats.
						</p>

						<img
							class="img-responsive anim-fade-in-enlarge"
							width="400"
							height="400"
							:src="monsterImage"
							alt="Monster"
						/>

						<p class="lead">Wait, is it getting bigger?</p>

						<app-progress-bar
							style="width: 100%"
							:percent="currentProgress"
							:indeterminate="isMax"
							:active="isMax"
						>
							<b>Mysterious Progress Bar</b>
						</app-progress-bar>
					</template>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-page
	margin: 0 auto
	max-width: 550px
	display: flex
	flex-direction: column
	align-items: center
	text-align: center
	color: var(--theme-fg)
</style>
