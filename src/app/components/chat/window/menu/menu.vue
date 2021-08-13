<script lang="ts" src="./menu"></script>

<template>
	<app-popper popover-class="fill-darkest" placement="bottom">
		<app-button v-app-tooltip="$gettext(`Manage...`)" circle sparse trans icon="ellipsis-h" />

		<template #popover>
			<div class="fill-darker">
				<div class="list-group list-group-dark">
					<template v-if="shouldShowEdit">
						<a class="list-group-item has-icon" @click="onClickEditTitle">
							<app-jolticon icon="edit" />
							<translate>Change title</translate>
						</a>

						<hr />
					</template>

					<app-chat-notification-settings
						:room-id="room.id"
						:is-pm-room="room.isPmRoom"
					/>

					<template v-if="shouldShowLeave">
						<hr />
						<a class="list-group-item has-icon" @click="leaveRoom">
							<app-jolticon icon="logout" notice />
							<translate>Leave Room</translate>
						</a>
					</template>
				</div>
			</div>
		</template>
	</app-popper>
</template>
