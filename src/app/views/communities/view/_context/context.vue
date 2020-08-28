<script lang="ts" src="./context"></script>

<template>
	<div v-if="routeStore.isLoaded" class="sidebar-context-channels">
		<div class="-card">
			<app-communities-view-card overflow />
		</div>

		<app-nav-channels v-if="!isEditing" />
		<app-nav-edit v-else @change-section="onChangeSection" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../../../../components/community/channel/card/variables'

.sidebar-context-channels
	padding: $shell-content-sidebar-padding

	@media $media-sm-up
		padding-right: 0

	> .-card
		max-width: $card-width
</style>
