<script lang="ts" src="./footer"></script>

<template>
	<footer id="footer" class="section">
		<div class="container">
			<template v-if="shouldShowAppPromotion">
				<div class="text-center">
					<p>
						<strong>Be the first!</strong>
						<br class="visible-xs" />
						Test the beta version of the Game Jolt app.
					</p>
					<app-app-buttons source="footer" />
				</div>

				<br />
			</template>

			<div class="clearfix">
				<div class="footer-links">
					<div class="row">
						<div class="col-xs-4 col-sm-3">
							<ol class="list-unstyled footer-link-list">
								<li v-if="shouldShowAppPromotion">
									<router-link
										:to="{ name: 'landing.app' }"
										@click.native="trackAppPromotionClick({ source: 'footer' })"
									>
										<translate>Mobile App</translate>
									</router-link>
								</li>
								<li>
									<router-link :to="{ name: 'landing.client' }">
										<translate>Client</translate>
									</router-link>
								</li>
								<li>
									<app-link-external
										href="https://www.redbubble.com/people/gamejolt/shop"
									>
										<translate>Merch</translate>
									</app-link-external>
								</li>
							</ol>
						</div>

						<div class="col-xs-4 col-sm-3">
							<ol class="list-unstyled footer-link-list">
								<li>
									<router-link
										:to="{
											name: 'landing.help',
											params: { path: 'guidelines' },
										}"
									>
										<translate>Site Guidelines</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{
											name: 'landing.help',
											params: { path: 'support' },
										}"
									>
										<translate>Support</translate>
									</router-link>
								</li>
								<li>
									<router-link :to="{ name: 'landing.about' }">
										<translate>About</translate>
									</router-link>
								</li>
							</ol>
						</div>
						<div class="col-xs-4 col-sm-3">
							<ol class="list-unstyled footer-link-list">
								<li>
									<router-link :to="{ name: 'legal.terms' }">
										<translate>legal.terms</translate>
									</router-link>
								</li>
								<li>
									<router-link :to="{ name: 'legal.privacy' }">
										<translate>legal.privacy</translate>
									</router-link>
								</li>
								<li v-if="!GJ_IS_CLIENT">
									<router-link :to="{ name: 'legal.cookies' }">
										<translate>Cookie Policy</translate>
									</router-link>
								</li>
							</ol>
						</div>
						<div class="col-xs-4 col-sm-3 hidden-xs">
							<div class="text-muted" style="margin-bottom: 4px">
								<small>
									<strong>
										<translate>For Developers</translate>
									</strong>
								</small>
							</div>
							<ol class="list-unstyled footer-link-list">
								<li>
									<router-link :to="{ name: 'landing.game-api' }">
										<translate>Game API</translate>
									</router-link>
								</li>
								<li>
									<router-link :to="{ name: 'landing.marketplace' }">
										<translate>Marketplace</translate>
									</router-link>
								</li>
								<li>
									<router-link :to="{ name: 'landing.partners' }">
										<translate>Partner Program</translate>
									</router-link>
								</li>
							</ol>
						</div>
					</div>
				</div>
			</div>

			<hr />

			<div class="clearfix">
				<div v-if="!Screen.isXs" class="footer-jolt">
					<router-link :to="{ name: 'home' }">
						<app-theme-svg
							src="~img/jolt.svg"
							alt=""
							width="68"
							height="72"
							strict-colors
						/>
					</router-link>
				</div>
				<div class="footer-meta">
					<p>
						<app-button
							trans
							circle
							icon="twitter-bird"
							href="https://twitter.com/gamejolt"
							target="_blank"
						/>
						<app-button
							trans
							circle
							icon="facebook"
							href="https://facebook.com/gamejolt"
							target="_blank"
						/>
					</p>

					<p class="tiny">&copy; {{ date(curDate, 'yyyy') }} Game Jolt Inc.</p>

					<p v-if="GJ_IS_CLIENT" class="tiny text-muted">
						<a class="link-muted" @click="showSystemReport">
							<translate>footer.send_system_report</translate>
						</a>
						<span class="dot-separator" />
						v{{ clientVersion }}
					</p>
				</div>
				<div class="footer-translations">
					<div>
						<app-translate-lang-selector />
					</div>

					<br class="hidden-xs" />

					<p class="small text-muted">
						<translate>footer.translations</translate>
						<!-- <br />
						<app-link-external href="https://poeditor.com/join/project/B4nWT6EgnD">
							<translate>footer.translations_help</translate>
						</app-link-external> -->
					</p>
				</div>
			</div>
		</div>
	</footer>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

#footer
	change-bg('darkest')
	padding-top: $grid-gutter-width * 0.5
	padding-bottom: 0
	position: relative
	z-index: $zindex-footer

	@media $media-xs
		text-align: center

.-app-logo
	margin-right: 10px

.footer
	&-link-list
		font-size: $font-size-tiny

		@media $media-sm-up
			font-size: $font-size-small

		& > li
			margin-bottom: 6px

			& > a
				theme-prop('color', 'fg-muted')

				&:hover
					color: $white

	@media $media-sm-up
		&-jolt
			float: left

		&-meta
			float: left
			margin-left: $grid-gutter-width

		&-translations
			float: right
			text-align: right
</style>
