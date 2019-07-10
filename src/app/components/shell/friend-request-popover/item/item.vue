<template>
	<app-scroll-inview
		class="-item"
		:extra-padding="Screen.height / 2"
		@inview="isInview = true"
		@outview="isInview = false"
	>
		<router-link v-if="isInview" :to="them.url">
			<app-card>
				<div class="shell-card-popover-card-media">
					<div class="friend-request-popover-avatar">
						<app-user-avatar-img :user="them" />
					</div>
				</div>
				<div class="shell-card-popover-card-body">
					<div class="shell-card-popover-card-controls">
						<!--
							For a tags we need to prevent click events in order to stop navigation.
							stopping propogation doesn't cut it because all it's doing is stopping
							the event handlers on the parent elements to fire, but the default beahviour
							of the elements is only prevented with 'prevent'.
						-->
						<template v-if="isPending">
							<app-button
								tag="span"
								trans
								circle
								icon="remove"
								v-app-tooltip="$gettext(`Cancel`)"
								@click.prevent="cancel"
							/>
						</template>
						<template v-else>
							<app-button
								tag="span"
								primary
								circle
								icon="friend-add-2"
								v-app-tooltip="$gettext(`Add Friend`)"
								@click.prevent="accept"
							/>
							<app-button
								tag="span"
								trans
								circle
								icon="remove"
								v-app-tooltip="$gettext(`Dismiss request. Sender will not be notified.`)"
								@click.prevent="reject"
							/>
						</template>
					</div>

					<div class="card-title">
						<h5 class="-name">{{ them.display_name }}</h5>
						<h5 class="-name">
							<small>@{{ them.username }}</small>
						</h5>
					</div>
				</div>
			</app-card>
		</router-link>
	</app-scroll-inview>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-item
	display: block
	height: 85px

.-name
	text-overflow()
</style>

<script lang="ts" src="./item"></script>
