<script lang="ts" src="./add-to-widget"></script>

<template>
	<app-popper
		v-if="game.isVisible"
		popover-class="fill-darkest"
		placement="bottom"
		@show="isShown = true"
		@hide="isShown = false"
	>
		<app-button
			v-app-auth-required
			v-app-tooltip.bottom="$gettext('Add to Playlist')"
			v-app-track-event="`add-to-playlist:widget:${eventLabel}`"
			icon="add"
			sparse
			:overlay="overlay"
			:circle="circle"
		/>

		<app-game-playlist-add-to-popover v-if="isShown" slot="popover" :game="game" />
	</app-popper>
</template>

