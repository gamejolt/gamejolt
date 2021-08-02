<script lang="ts" src="./follow-widget"></script>

<template>
	<app-popper
		class="game-follow-widget"
		popover-class="fill-darkest"
		trigger="manual"
		track-trigger-width
		:manual-show="isShowingFollowPopover"
		:block="block"
		@click-away="onFollowPopoverDismissed"
	>
		<app-button
			:id="widgetId"
			v-app-auth-required
			v-app-tooltip="tooltip"
			primary
			:icon="icon"
			:circle="circle"
			:overlay="overlay"
			:block="block"
			:lg="lg"
			:solid="game.is_following || solid"
			:badge="badge"
			@click="onClick"
		>
			<template v-if="!circle">
				<template v-if="!game.is_following">
					<translate>Follow</translate>
				</template>
				<template v-else>
					<translate>Following</translate>
				</template>
			</template>
		</app-button>

		<div slot="popover" class="well">
			<p class="small">
				<translate>
					Would you also like to follow this developer? You will get notified when they
					release new games.
				</translate>
			</p>
			<app-user-follow-widget :user="game.developer" block location="gameFollow" />
		</div>
	</app-popper>
</template>
