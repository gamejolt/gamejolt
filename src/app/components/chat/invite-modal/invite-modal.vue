<script lang="ts" src="./invite-modal"></script>
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
					<translate>Invite Friends</translate>
				</h2>
			</div>

			<div class="modal-body">
				<div class="friend-select-widget">
					<div class="nav-controls">
						<input
							v-model="filterQuery"
							text="search"
							class="form-control"
							placeholder="Filter..."
						/>
					</div>

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
			<div class="-footer">
				<app-button primary block :disabled="selectedUsers.length < 1" @click="invite">
					<translate>Invite</translate>
				</app-button>
			</div>
		</template>
	</app-modal>
</template>

<style lang="stylus" src="./invite-modal.styl" scoped></style>
