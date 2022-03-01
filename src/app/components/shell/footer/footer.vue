<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { trackAppPromotionClick } from '../../../../_common/analytics/analytics.service';
import AppContactLink from '../../../../_common/contact-link/contact-link.vue';
import { formatDate } from '../../../../_common/filters/date';
import AppMobileAppButtons from '../../../../_common/mobile-app/AppMobileAppButtons.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import AppTranslateLangSelector from '../../../../_common/translate/lang-selector/lang-selector.vue';
import { imageJolt } from '../../../img/images';

const ClientSystemReportModal = GJ_IS_DESKTOP_APP
	? (await import('../../client/system-report-modal/system-report-modal.service'))
			.ClientSystemReportModal
	: undefined;

@Options({
	components: {
		AppMobileAppButtons,
		AppTranslateLangSelector,
		AppThemeSvg,
		AppContactLink,
	},
})
export default class AppShellFooter extends Vue {
	curDate = new Date();

	readonly Screen = Screen;
	readonly formatDate = formatDate;
	readonly trackAppPromotionClick = trackAppPromotionClick;
	readonly imageJolt = imageJolt;

	get clientVersion() {
		return GJ_VERSION;
	}

	async showSystemReport() {
		ClientSystemReportModal?.show();
	}
}
</script>

<template>
	<footer id="footer" class="section">
		<div class="container">
			<template v-if="!GJ_IS_DESKTOP_APP">
				<div class="text-center">
					<AppMobileAppButtons source="footer" />
				</div>

				<br />
			</template>

			<div class="clearfix">
				<div class="footer-links">
					<div class="row">
						<div class="col-xs-4 col-sm-3">
							<ol class="list-unstyled footer-link-list">
								<li>
									<router-link
										:to="{ name: 'landing.app' }"
										@click="
											trackAppPromotionClick({
												source: 'footer',
												platform: 'mobile',
											})
										"
									>
										<AppTranslate>Mobile App</AppTranslate>
									</router-link>
								</li>
								<li v-if="!GJ_IS_DESKTOP_APP">
									<router-link
										:to="{ name: 'landing.client' }"
										@click="
											trackAppPromotionClick({
												source: 'footer',
												platform: 'desktop',
											})
										"
									>
										<AppTranslate>Desktop App</AppTranslate>
									</router-link>
								</li>
								<li>
									<AppLinkExternal
										href="https://www.redbubble.com/people/gamejolt/shop"
									>
										<AppTranslate>Merch</AppTranslate>
									</AppLinkExternal>
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
										<AppTranslate>Site Guidelines</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{
											name: 'landing.help',
											params: { path: 'support' },
										}"
									>
										<AppTranslate>Support</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link :to="{ name: 'landing.about' }">
										<AppTranslate>About</AppTranslate>
									</router-link>
								</li>
							</ol>
						</div>
						<div class="col-xs-4 col-sm-3">
							<ol class="list-unstyled footer-link-list">
								<li>
									<router-link :to="{ name: 'legal.terms' }">
										<AppTranslate>Terms</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link :to="{ name: 'legal.privacy' }">
										<AppTranslate>Privacy</AppTranslate>
									</router-link>
								</li>
								<li v-if="!GJ_IS_DESKTOP_APP">
									<router-link :to="{ name: 'legal.cookies' }">
										<AppTranslate>Cookie Policy</AppTranslate>
									</router-link>
								</li>
							</ol>
						</div>
						<div class="col-xs-4 col-sm-3 hidden-xs">
							<div class="text-muted" style="margin-bottom: 4px">
								<small>
									<strong>
										<AppTranslate>For Developers</AppTranslate>
									</strong>
								</small>
							</div>
							<ol class="list-unstyled footer-link-list">
								<li>
									<router-link :to="{ name: 'landing.game-api' }">
										<AppTranslate>Game API</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link :to="{ name: 'landing.marketplace' }">
										<AppTranslate>Marketplace</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link :to="{ name: 'landing.partners' }">
										<AppTranslate>Partner Program</AppTranslate>
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
						<AppThemeSvg :src="imageJolt" alt="" width="68" height="72" strict-colors />
					</router-link>
				</div>
				<div class="footer-meta">
					<p>
						<AppButton
							trans
							circle
							icon="twitter-bird"
							href="https://twitter.com/gamejolt"
							target="_blank"
						/>
						<AppButton
							trans
							circle
							icon="facebook"
							href="https://facebook.com/gamejolt"
							target="_blank"
						/>
					</p>

					<p class="tiny">&copy; {{ formatDate(curDate, 'yyyy') }} Game Jolt Inc.</p>

					<p v-if="GJ_IS_DESKTOP_APP" class="tiny text-muted">
						<a class="link-muted" @click="showSystemReport">
							<AppTranslate>Send System Report</AppTranslate>
						</a>
						<span class="dot-separator" />
						v{{ clientVersion }}
					</p>
				</div>
				<div class="footer-translations">
					<div>
						<AppTranslateLangSelector />
					</div>

					<br class="hidden-xs" />

					<p class="small text-muted">
						<AppTranslate>Translations are a community project.</AppTranslate>
					</p>
				</div>
			</div>
		</div>
	</footer>
</template>

<style lang="stylus" scoped>
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
