<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import { trackAppPromotionClick } from '../../../../_common/analytics/analytics.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppUserCreatorBadge from '../../../../_common/user/creator/AppUserCreatorBadge.vue';
import { routeLandingHelpRedirect } from '../../../views/landing/help/help.route';
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
						{{ $gettext(`Discover`) }}
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
						{{ $gettext(`Store`) }}
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
						{{ $gettext(`Search`) }}
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
						{{ $gettext(`Get the app`) }}
					</span>
				</RouterLink>
			</li>
			<li>
				<RouterLink
					:to="{
						name: routeLandingHelpRedirect.name,
						params: { path: 'guidelines' },
					}"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="forums" />
					</span>
					<span class="shell-nav-label">
						{{ $gettext(`Site guidelines`) }}
					</span>
				</RouterLink>
			</li>
			<li>
				<RouterLink
					:to="{
						name: 'landing.creators',
					}"
				>
					<span class="shell-nav-icon">
						<AppUserCreatorBadge />
					</span>
					<span class="shell-nav-label">
						{{ $gettext(`Become a creator`) }}
					</span>
				</RouterLink>
			</li>
			<li>
				<AppLinkExternal href="https://www.redbubble.com/people/gamejolt/shop">
					<span class="shell-nav-icon">
						<AppJolticon icon="gift" />
					</span>
					<span class="shell-nav-label">
						{{ $gettext(`Merch`) }}
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
						{{ $gettext(`About`) }}
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
