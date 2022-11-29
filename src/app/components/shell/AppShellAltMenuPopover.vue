<script lang="ts" setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { trackAppPromotionClick } from '../../../_common/analytics/analytics.service';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import AppLinkExternal from '../../../_common/link/AppLinkExternal.vue';
import AppPopper from '../../../_common/popper/AppPopper.vue';
import { Screen } from '../../../_common/screen/screen-service';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppUserCreatorBadge from '../../../_common/user/creator/AppUserCreatorBadge.vue';
import { ClientSystemReportModal } from '../client/safe-exports';
import AppShellAltMenuDevelopers from './AppShellAltMenuDevelopers.vue';
import AppShellAltMenuExtra from './AppShellAltMenuExtra.vue';

const moreMenuShowing = ref(false);

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
								platform: Screen.isDesktop ? 'desktop' : 'mobile',
							})
						"
					>
						<AppJolticon icon="download-box" />
						{{ $gettext(`Get the app`) }}
					</RouterLink>

					<RouterLink
						class="list-group-item has-icon"
						:to="{
							name: 'landing.help',
							params: { path: 'guidelines' },
						}"
					>
						<AppJolticon icon="forums" />
						{{ $gettext(`Site guidelines`) }}
					</RouterLink>

					<RouterLink
						class="list-group-item has-icon"
						:to="{
							name: 'landing.creators',
						}"
					>
						<AppUserCreatorBadge class="list-group-item-icon" />
						{{ $gettext(`Become a creator`) }}
					</RouterLink>

					<AppLinkExternal
						class="list-group-item has-icon"
						href="https://www.redbubble.com/people/gamejolt/shop"
					>
						<AppJolticon icon="gift" />
						{{ $gettext(`Merch`) }}
					</AppLinkExternal>

					<RouterLink
						class="list-group-item has-icon"
						:to="{
							name: 'landing.about',
						}"
					>
						<AppJolticon icon="info-circle" />
						{{ $gettext(`About`) }}
					</RouterLink>
				</div>

				<div class="-split">
					<div class="-split-inner" />
				</div>

				<div class="-right">
					<AppShellAltMenuDevelopers />
					<div class="-spacer" />
					<AppShellAltMenuExtra />

					<template v-if="GJ_IS_DESKTOP_APP">
						<AppSpacer vertical :scale="2" />

						<div class="-extra-links">
							v{{ GJ_VERSION }}
							<div class="-dot" />
							<a @click="showSystemReport">
								{{ $gettext(`Send system report`) }}
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
</style>
