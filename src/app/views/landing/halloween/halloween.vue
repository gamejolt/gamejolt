<template>
	<div>
		<section class="section landing-header text-center">
			<div class="container">
				<h1 style="color: orange">
					<b>It's Halloweeeeeen [¬º-°]¬</b>
				</h1>

				<div class="row">
					<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
						<p class="lead">Spooky monsters are invading Game Jolt!</p>
					</div>
				</div>
			</div>
		</section>

		<div class="landing-body">
			<section class="section">
				<div class="container">
					<h1 class="section-header text-center">
						AHH! SPOOKY!
					</h1>

					<hr class="underbar underbar-center" />
					<br />

					<div class="row">
						<div class="col-sm-10 col-md-8 col-lg-6 col-centered text-center">
							<p>
								Monsters have invaded Game Jolt again, and we need
								<em>your</em>
								help! Join forces with other Jolters to defeat the waves of monsters!
							</p>
						</div>
					</div>
				</div>
			</section>

			<section class="section fill-lightest">
				<div class="container">
					<div class="row">
						<div class="col-lg-1"></div>
						<div class="col-sm-7 col-md-6 col-lg-5">
							<h2 class="sans-margin-top">Find monsters</h2>
							<p>
								Monsters are hiding all over the site. If you encounter one, click on it to begin
								combat! The monsters do not like to be poked and will try to avoid you, so be quick!
							</p>

							<br />
							<h2 class="sans-margin-top">Unlock Achievements</h2>
							<p>
								Fending off different monsters will unlock achievements and ranks of honor that will
								be visible on your profile! Can you achieve the highest ranks?
							</p>
						</div>
						<div class="col-md-1"></div>
						<div class="col-sm-5">
							<div class="landing-graphic-full hidden-xs">
								<img
									class="img-responsive"
									src="~img/halloween/pumpkin.png"
									alt=""
									style="transform: scaleX(-1); margin-left: -100px"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="section">
				<div class="container">
					<div class="row">
						<div class="col-sm-5 col-sm-push-7 col-md-push-0">
							<div class="landing-graphic-full hidden-xs">
								<img class="img-responsive" src="~img/halloween/vampire.png" alt="" />
							</div>
						</div>
						<div class="col-md-1"></div>
						<div class="col-sm-7 col-sm-pull-5 col-md-6 col-md-pull-0 col-lg-5">
							<h2 class="section-header">Community Goals</h2>
							<hr class="underbar" />

							<br />
							<h4 class="sans-margin-top">Gotta catch 'em all</h4>
							<p>
								Rumors have it there are around 2,000 monsters of each type! If all of them are
								defeated before it's too late, all participant's ranks and achievements will become
								permanent!
							</p>

							<br />
							<h4 class="sans-margin-top">Rare? share!</h4>
							<p>
								Post links to where you found rare monsters on the
								<a href="/c/halloween-2019">Halloween Community</a>
								. Everyone can see the same monsters, so you can work together to unlock the rare
								monster trophies!
							</p>
						</div>
					</div>
				</div>
			</section>

			<section class="section fill-lightest" id="monster-stats">
				<div class="container text-center">
					<h1 class="section-header">
						Global Stats
					</h1>

					<div class="row">
						<div class="col-lg-7 col-centered">
							<p class="lead">Here is how many monsters we caught so far</p>
						</div>
					</div>

					<hr class="underbar underbar-center" />
					<br />

					<div class="-monster-avatar" v-for="(data, monsterType) in breakdown" :key="monsterType">
						<span
							:style="{
								width:
									Math.min(((data.current - data.start) * 100) / (data.end - data.start), 100) +
									'%',
							}"
						/>

						<img :src="img[monsterType]" />

						<app-progress-bar
							:percent="
								Math.min(((data.current - data.start) * 100) / (data.end - data.start), 100)
							"
							indeterminate
							active
						/>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-monster-avatar
	text-align: left

	span
		display: inline-block

	img
		position: absolute
		margin-top: -30px
		margin-left: -30px
		width: 100px
		height: 100px
		z-index: 2

	>>> .progress
		background-color: var(--theme-bg-offset)
		height: 40px
		margin-bottom: 50px

</style>

<script lang="ts" src="./halloween"></script>
