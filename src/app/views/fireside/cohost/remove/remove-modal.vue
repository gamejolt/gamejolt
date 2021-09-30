<script lang="ts" src="./remove-modal"></script>

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
					<translate>Choose Members</translate>
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
								@click="toggle(user)"
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
								<div class="-radio" :class="{ '-active': selected(user) }">
									<app-jolticon
										:icon="selected(user) ? 'checkbox' : 'box-empty'"
									/>
								</div>
							</div>
						</div>
					</app-scroll-scroller>
				</div>
			</div>
		</template>

		<template #footer>
			<div class="-bottom">
				<app-user-avatar-list
					v-if="selectedUsers.length > 0"
					class="-selected-users"
					:users="selectedUsers"
					sm
				/>

				<app-button primary block :disabled="selectedUsers.length < 1" @click="invite">
					<translate>Remove Cohosts</translate>
				</app-button>
			</div>
		</template>
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
</style>
