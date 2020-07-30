<template>
	<div v-if="!isLoading" class="sidebar-context-channels">
		<div class="-card">
			<app-communities-view-card overflow />
		</div>

		<app-nav-channels v-if="!isEditing" />
		<app-nav-edit v-else @change-section="onChangeSection" />
	</div>
</template>

<script lang="ts" src="./channels"></script>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../../../../community/channel/card/variables'

.sidebar-context-channels
	padding: $shell-content-sidebar-padding

	@media $media-sm-up
		padding-right: 0

	> .-card
		max-width: $card-width
</style>
