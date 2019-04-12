<template>
	<div
		class="client-installed-game"
		:class="{
			'-is-installing': isInstalling,
			'-is-active': isShowingOptions || isShowingLaunchOptions,
		}"
		@mouseenter="isHovering = true"
		@mouseleave="isHovering = false"
	>
		<app-game-thumbnail class="-thumb" :game="game._game" hide-pricing hide-controls />

		<!--
		Try to reduce the # of watchers on page.
	-->
		<div class="-meta-outer" v-if="shouldShowControls">
			<div class="-meta">
				<app-client-game-buttons
					:game="game._game"
					overlay
					has-installable-builds
					can-install
					@show-options="isShowingOptions = true"
					@hide-options="isShowingOptions = false"
					@show-launch-options="isShowingLaunchOptions = true"
					@hide-launch-options="isShowingLaunchOptions = false"
				/>

				<span class="-version">
					<template v-if="!hasMultiplePackages">
						{{ packageVersion }}
					</template>
					<template v-else>
						<translate>library.installed.multiple_packages</translate>
					</template>
				</span>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./game.styl" scoped></style>

<script lang="ts" src="./game"></script>
