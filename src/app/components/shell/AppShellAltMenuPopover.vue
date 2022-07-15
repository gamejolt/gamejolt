<script lang="ts" setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { trackAppPromotionClick } from '../../../_common/analytics/analytics.service';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import AppLinkExternal from '../../../_common/link/AppLinkExternal.vue';
import AppPopper from '../../../_common/popper/AppPopper.vue';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { TranslateLangSelectorModal } from '../../../_common/translate/lang-selector/lang-selector-modal.service';
import { ClientSystemReportModal } from '../client/safe-exports';

const moreMenuShowing = ref(false);

function showLangSelector() {
	TranslateLangSelectorModal.show();
}

function showSystemReport() {
	ClientSystemReportModal?.show();
}
</script>

<template>
	<AppPopper
		v-app-track-event="`top-nav:more-menu:toggle`"
		popover-class="fill-darkest"
		placement="bottom-start"
		hide-on-state-change
		fixed
		width="516px"
		@show="moreMenuShowing = true"
		@hide="moreMenuShowing = false"
	>
		<a class="navbar-item" :class="{ active: moreMenuShowing }">
			<AppJolticon icon="ellipsis-v" />
		</a>

		<template #popover>
			<div class="-container list-group-dark">
				<div class="-left">
					<RouterLink
						class="list-group-item has-icon"
						:to="{ name: 'landing.app' }"
						@click="
							trackAppPromotionClick({
								source: 'top-nav-options',
								platform: 'mobile',
							})
						"
					>
						<AppJolticon icon="phone" />
						<AppTranslate>Get the Mobile App</AppTranslate>
					</RouterLink>

					<RouterLink
						v-if="!GJ_IS_DESKTOP_APP"
						class="list-group-item has-icon"
						:to="{ name: 'landing.client' }"
						@click="
							trackAppPromotionClick({
								source: 'top-nav-options',
								platform: 'desktop',
							})
						"
					>
						<AppJolticon icon="client" />
						<AppTranslate>Get the Desktop App</AppTranslate>
					</RouterLink>

					<RouterLink
						class="list-group-item has-icon"
						:to="{
							name: 'landing.help',
							params: { path: 'guidelines' },
						}"
					>
						<AppJolticon icon="forums" />
						<AppTranslate>Site Guidelines</AppTranslate>
					</RouterLink>

					<AppLinkExternal
						class="list-group-item has-icon"
						href="https://www.redbubble.com/people/gamejolt/shop"
					>
						<AppJolticon icon="gift" />
						<AppTranslate>Merch</AppTranslate>
					</AppLinkExternal>

					<RouterLink
						class="list-group-item has-icon"
						:to="{
							name: 'landing.help',
							params: { path: 'support' },
						}"
					>
						<AppJolticon icon="info-circle" />
						<AppTranslate>About</AppTranslate>
					</RouterLink>
				</div>

				<div class="-split">
					<div class="-split-inner" />
				</div>

				<div class="-right">
					<div class="-small-heading">
						<AppTranslate>For Developers</AppTranslate>
					</div>

					<ol class="list-unstyled -link-list">
						<li>
							<RouterLink :to="{ name: 'landing.game-api' }">
								<AppTranslate>Game API</AppTranslate>
							</RouterLink>
						</li>
						<li>
							<RouterLink :to="{ name: 'landing.marketplace' }">
								<AppTranslate>Marketplace</AppTranslate>
							</RouterLink>
						</li>
						<li>
							<RouterLink :to="{ name: 'landing.partners' }">
								<AppTranslate>Partner Program</AppTranslate>
							</RouterLink>
						</li>
					</ol>

					<div class="-spacer" />

					<div class="-extra-links">
						<router-link
							:to="{
								name: 'landing.help',
								params: { path: 'support' },
							}"
						>
							<AppTranslate>Support</AppTranslate>
						</router-link>
						<div class="-dot" />
						<router-link :to="{ name: 'legal.terms' }">
							<AppTranslate>Terms</AppTranslate>
						</router-link>
						<div class="-dot" />
						<router-link :to="{ name: 'legal.privacy' }">
							<AppTranslate>Privacy</AppTranslate>
						</router-link>
						<div class="-row-break" />
						<router-link :to="{ name: 'legal.cookies' }">
							<AppTranslate>Cookie Policy</AppTranslate>
						</router-link>
						<div class="-dot" />
						<a @click="showLangSelector">
							<AppTranslate>Change Language</AppTranslate>
						</a>
					</div>

					<template v-if="GJ_IS_DESKTOP_APP">
						<AppSpacer vertical :scale="2" />

						<div class="-extra-links">
							v{{ GJ_VERSION }}
							<div class="-dot" />
							<a @click="showSystemReport">
								<AppTranslate>Send System Report</AppTranslate>
							</a>
						</div>
					</template>
				</div>
			</div>
		</template>
	</AppPopper>
</template>

<style lang="stylus" scoped>
.-container
	display: flex

.-left
.-right
	width: 50%

.-split
	display: flex
	width: 1px
	padding: 16px 0
	flex-direction: column

.-split-inner
	width: 1px
	height: 100%
	background-color: var(--theme-bg-subtle)

.-right
	padding: 16px 16px 16px 20px
	display: flex
	flex-direction: column
	font-size: 13px

.-spacer
	flex: auto

.-row-break
	width: 100%

.-small-heading
	color: var(--theme-fg-muted)
	margin-bottom: 16px

.-link-list
	& > li
		margin-bottom: 6px

	& a
		color: var(--theme-fg)

		&:hover
			color: var(--theme-link)

.-extra-links
	display: flex
	flex-direction: row
	align-items: center
	flex-wrap: wrap
	color: var(--theme-fg-muted)

	a
		color: var(--theme-fg-muted)

		&:hover
			color: var(--theme-link)

	.-dot
		margin: 0 8px
		width: 2px
		height: 2px
		border-radius: 50%
		background-color: var(--theme-fg-muted)
</style>
