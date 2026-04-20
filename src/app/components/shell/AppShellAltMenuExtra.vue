<script lang="ts" setup>
import { RouterLink } from 'vue-router';

import { routeUrlLandingHelpRedirect } from '~app/views/landing/help/help.route';
import { routeLegalCookies } from '~app/views/legal/cookies/cookies.route';
import { routeLegalPrivacy } from '~app/views/legal/privacy/privacy.route';
import { routeLegalSafety } from '~app/views/legal/safety/safety.route';
import { routeLegalTerms } from '~app/views/legal/terms/terms.route';
import { showTranslateLangSelectorModal } from '~common/translate/lang-selector/lang-selector-modal.service';

function showLangSelector() {
	showTranslateLangSelectorModal();
}
</script>

<template>
	<div class="-extra-links">
		<RouterLink :to="routeUrlLandingHelpRedirect({ path: 'support' })">
			{{ $gettext(`Support`) }}
		</RouterLink>
		<div class="-row-break" />
		<RouterLink :to="{ name: routeLegalTerms.name }">
			{{ $gettext(`Terms`) }}
		</RouterLink>
		<div class="-dot" />
		<RouterLink :to="{ name: routeLegalPrivacy.name }">
			{{ $gettext(`Privacy`) }}
		</RouterLink>
		<div class="-dot" />
		<RouterLink :to="{ name: routeLegalSafety.name }">
			{{ $gettext(`Child Safety`) }}
		</RouterLink>
		<div class="-row-break" />
		<RouterLink :to="{ name: routeLegalCookies.name }">
			{{ $gettext(`Cookie policy`) }}
		</RouterLink>
		<div class="-dot" />
		<a @click="showLangSelector">
			{{ $gettext(`Change language`) }}
		</a>
	</div>
</template>

<style lang="stylus" scoped>
.-extra-links
	display: flex
	flex-direction: row
	align-items: center
	flex-wrap: wrap
	font-size: 13px
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

.-row-break
	width: 100%
</style>
