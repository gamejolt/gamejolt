<script lang="ts" setup>
import { HTMLAttributes } from 'vue';
import { RouterLink } from 'vue-router';

import AppShellAltMenuDevelopers from '~app/components/shell/AppShellAltMenuDevelopers.vue';
import AppShellAltMenuExtra from '~app/components/shell/AppShellAltMenuExtra.vue';
import { routeUrlLandingHelpRedirect } from '~app/views/landing/help/help.route';
import { trackAppPromotionClick } from '~common/analytics/analytics.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLinkExternal from '~common/link/AppLinkExternal.vue';
import { Screen } from '~common/screen/screen-service';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import AppUserCreatorBadge from '~common/user/creator/AppUserCreatorBadge.vue';

defineProps</* @vue-ignore */ Pick<HTMLAttributes, 'onClick'>>();
</script>

<template>
	<div id="shell-sidebar-mobile">
		<ul v-if="Screen.isXs" class="shell-nav">
			<li>
				<RouterLink :to="{ name: 'discover.home' }" active-class="active">
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
				<RouterLink :to="routeUrlLandingHelpRedirect({ path: 'guidelines' })">
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
