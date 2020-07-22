<template>
	<div class="sidebar-context-channels">
		<div class="-card">
			<app-communities-view-card :community="community" overflow />
		</div>

		<app-nav-channels v-if="!isEditing" />
		<app-nav-edit v-else />
	</div>
</template>

<script lang="ts" src="./channels"></script>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../../../../community/channel/card/variables'

.sidebar-context-channels
	> .-card
		max-width: $card-width
</style>
