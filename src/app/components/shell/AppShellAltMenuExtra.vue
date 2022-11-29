<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import { TranslateLangSelectorModal } from '../../../_common/translate/lang-selector/lang-selector-modal.service';

function showLangSelector() {
	TranslateLangSelectorModal.show();
}
</script>

<template>
	<div class="-extra-links">
		<RouterLink
			:to="{
				name: 'landing.help',
				params: { path: 'support' },
			}"
		>
			{{ $gettext(`Support`) }}
		</RouterLink>
		<div class="-dot" />
		<RouterLink :to="{ name: 'legal.terms' }">
			{{ $gettext(`Terms`) }}
		</RouterLink>
		<div class="-dot" />
		<RouterLink :to="{ name: 'legal.privacy' }">
			{{ $gettext(`Privacy`) }}
		</RouterLink>
		<div class="-row-break" />
		<RouterLink :to="{ name: 'legal.cookies' }">
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
