<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import { trackAppPromotionClick } from '../../../../_common/analytics/analytics.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppShellAltMenuDevelopers from '../AppShellAltMenuDevelopers.vue';
import AppShellAltMenuExtra from '../AppShellAltMenuExtra.vue';
</script>

<template>
	<div id="shell-sidebar-mobile">
		<ul v-if="Screen.isXs" class="shell-nav">
			<li>
				<RouterLink
					v-app-track-event="`sidebar:discover`"
					:to="{ name: 'discover.home' }"
					active-class="active"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="compass-needle" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Discover</AppTranslate>
					</span>
				</RouterLink>
			</li>

			<li>
				<RouterLink
					v-app-track-event="`sidebar:store`"
					:to="{
						name: 'discover.games.list._fetch',
						params: { section: null },
					}"
					:class="{ active: String($route.name).startsWith('discover.games.') }"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="gamepad" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Store</AppTranslate>
					</span>
				</RouterLink>
			</li>

			<li>
				<RouterLink
					v-app-track-event="`sidebar:search`"
					:to="{ name: 'search.results' }"
					:class="{ active: $route.name && String($route.name).indexOf('search') === 0 }"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="search" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Search</AppTranslate>
					</span>
				</RouterLink>
			</li>
		</ul>

		<hr />

		<ul class="shell-nav">
			<li>
				<RouterLink
					:to="{ name: 'landing.app' }"
					@click="
						trackAppPromotionClick({
							source: 'sidebar',
							platform: 'mobile',
						})
					"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="phone" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Get the Mobile App</AppTranslate>
					</span>
				</RouterLink>
			</li>
			<li>
				<RouterLink
					:to="{
						name: 'landing.help',
						params: { path: 'guidelines' },
					}"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="forums" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Site Guidelines</AppTranslate>
					</span>
				</RouterLink>
			</li>
			<li>
				<AppLinkExternal href="https://www.redbubble.com/people/gamejolt/shop">
					<span class="shell-nav-icon">
						<AppJolticon icon="gift" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Merch</AppTranslate>
					</span>
				</AppLinkExternal>
			</li>
			<li>
				<RouterLink
					:to="{
						name: 'landing.about',
					}"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="info-circle" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>About</AppTranslate>
					</span>
				</RouterLink>
			</li>
		</ul>

		<hr />

		<div class="-alt">
			<AppShellAltMenuDevelopers />
			<AppSpacer vertical :scale="10" />
			<AppShellAltMenuExtra />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-alt
	padding: 16px

hr
	margin-left: 12px
	margin-right: 12px
</style>
