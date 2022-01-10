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
					<translate>Manage Hosts</translate>
				</h2>
			</div>

			<div class="modal-body">
				<div class="friend-select-widget">
					<input
						v-model="filterQuery"
						class="-filter form-control"
						placeholder="Filter..."
					/>

					<app-illustration v-if="filteredUsers.length === 0" :src="illNoCommentsSmall">
						<p>
							<translate>There are no people here.</translate>
						</p>
					</app-illustration>
					<div v-else class="-user-list">
						<div v-for="user of filteredUsers" :key="user.id" class="-user-list-item">
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
									:solid="isHost(user)"
									:primary="isHost(user)"
									@click="processUser(user)"
								>
									<translate v-if="!isHost(user)">Add</translate>
									<translate v-else>Remove</translate>
								</app-button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</app-modal>
</template>

<style lang="stylus" scoped>
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

	&:last-child
		border-bottom: 0

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

.-action
	display: inline-flex
	grid-gap: 12px
	align-items: center

.-live
	rounded-corners()
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
