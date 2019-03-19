<template>
	<footer id="footer" class="section">
		<div class="container">
			<template v-if="!Screen.isXs">
				<div class="text-center" v-if="!GJ_IS_CLIENT">
					<p>
						<router-link
							class="-client-logo"
							:to="{ name: 'landing.client' }"
							v-app-track-event="`footer:client-promo`"
						>
							<app-theme-svg src="~img/game-jolt-client-logo.svg" alt="Game Jolt Client" />
						</router-link>
						<app-button solid primary :to="{ name: 'landing.client' }">
							<translate>Get It Now</translate>
						</app-button>
					</p>
				</div>

				<br />
			</template>

			<div class="clearfix">
				<div class="footer-links">
					<div class="row">
						<div class="col-xs-4 col-sm-3">
							<ol class="list-unstyled footer-link-list">
								<li>
									<router-link :to="{ name: 'landing.learn' }">
										<translate>What's Game Jolt</translate>
									</router-link>
								</li>
								<li>
									<router-link :to="{ name: 'landing.client' }">
										<translate>Client</translate>
									</router-link>
								</li>
								<li>
									<a href="http://jams.gamejolt.com" target="_blank">
										<translate>Jams</translate>
									</a>
								</li>
								<li>
									<router-link :to="{ name: 'forums.landing.overview' }">
										<translate>Forums</translate>
									</router-link>
								</li>
							</ol>
						</div>
						<div class="col-xs-4 col-sm-3">
							<ol class="list-unstyled footer-link-list">
								<li>
									<router-link :to="{ name: 'landing.about' }">
										<translate>About</translate>
									</router-link>
								</li>
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
										<translate>Partners</translate>
									</router-link>
								</li>
							</ol>
						</div>
						<div class="col-xs-4 col-sm-3 hidden-xs">
							<ol class="list-unstyled footer-link-list">
								<li>
									<a href="https://github.com/gamejolt" target="_blank">
										<translate>footer.open_source</translate>
									</a>
								</li>
								<li>
									<router-link
										:to="{ name: 'forums.channels.view', params: { name: 'gj-improve' } }"
									>
										<translate>Feature Requests</translate>
									</router-link>
								</li>
								<li>
									<a href="https://github.com/gamejolt/issue-tracker" target="_blank">
										<translate>Bug Tracker</translate>
									</a>
								</li>
								<li>
									<a href="https://www.redbubble.com/people/gamejolt/shop" target="_blank">
										<translate>Merch</translate>
									</a>
								</li>
							</ol>
						</div>
						<div class="col-xs-4 col-sm-3">
							<ol class="list-unstyled footer-link-list">
								<li>
									<a href="mailto:contact@gamejolt.com">
										<translate>footer.contact</translate>
									</a>
								</li>
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
					</div>
				</div>
			</div>

			<hr />

			<div class="clearfix">
				<div class="footer-jolt" v-if="!Screen.isXs">
					<router-link :to="{ name: 'home' }">
						<app-theme-svg src="~img/jolt.svg" alt="" width="68" height="72" />
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

					<p class="tiny">&copy; {{ curDate | date('YYYY') }} Lucent Web Creative, LLC</p>

					<p class="tiny text-muted" v-if="GJ_IS_CLIENT">
						<a @click="showSystemReport" class="link-muted">
							<translate>footer.send_system_report</translate>
						</a>
						<span class="dot-separator"></span>
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
						<br />
						<a href="https://poeditor.com/join/project/B4nWT6EgnD" target="_blank">
							<translate>footer.translations_help</translate>
						</a>
					</p>
				</div>
			</div>
		</div>
	</footer>
</template>

<style lang="stylus" src="./footer.styl" scoped />

<script lang="ts" src="./footer" />
