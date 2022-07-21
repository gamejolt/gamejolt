<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
</script>

<template>
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
</template>

<style lang="stylus" scoped>
.-small-heading
	color: var(--theme-fg-muted)
	margin-bottom: 16px

.-link-list
	font-size: 13px

	& > li
		margin-bottom: 6px

	& a
		color: var(--theme-fg)

		&:hover
			color: var(--theme-link)
</style>
