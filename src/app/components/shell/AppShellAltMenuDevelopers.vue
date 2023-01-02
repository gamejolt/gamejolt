<script lang="ts" setup>
import { RouterLink } from 'vue-router';
</script>

<template>
	<div class="-small-heading">
		{{ $gettext(`For developers`) }}
	</div>

	<ol class="list-unstyled -link-list">
		<li>
			<RouterLink :to="{ name: 'landing.game-api' }">
				{{ $gettext(`Game API`) }}
			</RouterLink>
		</li>
		<li>
			<RouterLink :to="{ name: 'landing.marketplace' }">
				{{ $gettext(`Game marketplace`) }}
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
