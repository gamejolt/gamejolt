<template>
	<div v-if="game">
		<section class="section fill-darker" v-if="shouldBlock">
			<div class="container">
				<div class="row">
					<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
						<div class="game-maturity-block">
							<h4><translate>This game is tagged for mature audiences.</translate></h4>
							<p><translate>It could contain content you may not want to view.</translate></p>
							<br />

							<app-game-ogrs :game="game" />
							<br />

							<p>
								<app-button block primary @click="proceed">
									<translate>Proceed to Game</translate>
								</app-button>
							</p>

							<br />
							<hr class="underbar underbar-center" />

							<p>
								<a class="link-muted" @click="removeRestriction">
									<translate>Don't ask me again, geez...</translate>
								</a>
							</p>

							<p class="small text-muted">
								<translate>This setting will apply to this browser/device only.</translate>
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<div v-else>
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.game-maturity-block
	@media $media-sm-up
		text-align: center

	&-img
		display: inline-block
		border: 6px solid $black
		margin-bottom: $line-height-computed

	h4
		theme-prop('color', 'notice')

		@media $media-xs
			margin-top: 0

	>>> .game-ogrs
		margin: 0 auto
		text-align: left
		max-width: 350px
		margin-bottom: $line-height-computed

		&.no-descriptors
			float: none !important
			width: 88px
</style>

<script lang="ts" src="./maturity-block" />
