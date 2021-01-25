<script lang="ts" src="./competition"></script>

<template>
	<app-communities-view-page-container>
		<app-nav-tab-list>
			<app-communities-edit-competition-nav />
		</app-nav-tab-list>

		<router-view />

		<!-- <template #sidebar>
			<nav v-if="!Screen.isMobile" class="platform-list -sidebar-nav">
				<app-communities-edit-competition-nav />
			</nav>
		</template> -->
	</app-communities-view-page-container>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

// Needed for the icons to show correctly.
.-sidebar-nav
	li > a
		position: relative
</style>
