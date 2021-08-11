<script lang="ts" src="./block-overlay"></script>

<template>
	<div v-if="user">
		<section v-if="shouldBlock" class="section fill-darker">
			<div class="container">
				<div class="row">
					<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
						<div class="user-block">
							<app-jolticon class="jolticon-4x" icon="friend-remove-2" notice />

							<h4><translate>You blocked this user.</translate></h4>
							<p>
								<translate>Are you sure you want to view their profile?</translate>
							</p>
							<br />

							<p class="-buttons">
								<app-button trans @click="proceed">
									<translate>Proceed to Profile</translate>
								</app-button>
							</p>

							<br />
							<hr class="underbar underbar-center" />

							<p>
								<router-link
									class="link-muted"
									:to="{ name: 'dash.account.blocks' }"
								>
									<translate>Manage blocked users</translate>
								</router-link>
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
@import '~styles/variables'
@import '~styles-lib/mixins'

.user-block
	text-align: center

	h4
		theme-prop('color', 'notice')

		@media $media-xs
			margin-top: 4px

	.-buttons button
		margin-bottom: 20px
</style>
