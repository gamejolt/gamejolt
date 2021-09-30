<script lang="ts" src="./manage-modal"></script>

<template>
	<app-modal>
		<template #default>
			<div class="modal-controls">
				<app-button @click="modal.dismiss()">
					<translate>Close</translate>
				</app-button>
			</div>

			<div class="modal-header">
				<h2 class="modal-title">
					<translate>Manage Cohosts</translate>
				</h2>
			</div>

			<div class="modal-body">
				<div class="friend-select-widget">
					<input
						v-model="filterQuery"
						class="-filter form-control"
						placeholder="Filter..."
					/>

					<app-scroll-scroller>
						<div class="-user-list">
							<div
								v-for="user of filteredUsers"
								:key="user.id"
								class="-user-list-item"
							>
								<div class="-avatar">
									<app-user-avatar-img :user="user" />
								</div>

								<div class="-label">
									<div class="-name">
										{{ user.display_name }}
									</div>
									<div class="-username">@{{ user.username }}</div>
								</div>

								<div class="-action">
									<div v-if="isUserStreaming(user)" class="-live">
										<translate>LIVE</translate>
									</div>

									<app-button
										:disabled="isUserProcessing(user)"
										:solid="isCohost(user)"
										:primary="isCohost(user)"
										@click="processUser(user)"
									>
										<translate v-if="!isCohost(user)">Add</translate>
										<translate v-else>Remove</translate>
									</app-button>
								</div>
								<!-- <div class="-radio" :class="{ '-active': selected(user) }">
									<app-jolticon
										:icon="selected(user) ? 'checkbox' : 'box-empty'"
									/>
								</div> -->
							</div>
						</div>
					</app-scroll-scroller>
				</div>
			</div>
		</template>

		<!-- <template #footer>
			<div class="-bottom">
				<app-user-avatar-list
					v-if="selectedUsers.length > 0"
					class="-selected-users"
					:users="selectedUsers"
					sm
				/>

				<app-button primary block :disabled="selectedUsers.length < 1" @click="invite">
					<translate>Invite Cohosts</translate>
				</app-button>
			</div>
		</template> -->
	</app-modal>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

$-v-padding = 15px
$-h-padding = 20px
$-height = 40px

.-filter
	margin-bottom: 8px

.-user-list-item
	theme-prop('border-bottom-color', 'bg-subtle')
	display: flex
	align-items: center
	padding: $-v-padding 0
	height: $-height + $-v-padding * 2
	overflow: hidden
	border-bottom-width: $border-width-small
	border-bottom-style: solid
	cursor: pointer

	&:last-child
		border-bottom: 0

	&:hover
		.-radio
			color: var(--theme-link-hover)

.-radio
	color: var(--theme-bg-subtle)

	&.-active
		color: var(--theme-highlight)

.-avatar
	flex: none
	width: $-height
	margin-right: $-h-padding

.-label
	flex: auto
	overflow: hidden

.-name
.-username
	text-overflow()

.-name
	font-weight: bold

.-username
	theme-prop('color', 'fg-muted')
	font-size: $font-size-small

.-button
	flex: none
	margin-left: $-h-padding

.-selected-users
	display: flex
	justify-content: center
	margin-top: -10px
	margin-bottom: 4px

.-bottom
	padding-bottom: $line-height-computed

.-action
	display: inline-flex
	grid-gap: 12px
	align-items: center

.-live
	rounded-corners-lg()
	margin: 0
	padding: 4px 8px
	font-size: $font-size-h3
	font-weight: 700
	font-family: $font-family-heading
	text-shadow: none
	box-shadow: 1px 1px 3px $black
	letter-spacing: 2px
	color: $white
	background-color: $gj-overlay-notice
</style>
