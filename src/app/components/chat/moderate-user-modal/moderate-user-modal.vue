<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Moderate</translate>
				<small>@{{ user.username }}</small>
			</h2>
		</div>

		<div class="modal-body">
			<template v-if="canModerate">
				<template v-if="chat.canModerate(room, user, 'mute')">
					<app-button v-if="!user.isMutedRoom" type="span" @click="mute">
						<translate>Mute</translate>
					</app-button>
					<app-button v-else type="span" @click="unmute">
						<translate>Unmute</translate>
					</app-button>
				</template>

				<template v-if="chat.canModerate(room, user, 'mod')">
					<app-button v-if="!user.isMod" type="span" @click="mod">
						<translate>Mod</translate>
					</app-button>

					<app-button v-else type="span" @click="demod">
						<translate>Demod</translate>
					</app-button>
				</template>
			</template>
			<template v-else>
				<translate>You don't have the correct permissions to moderate this user.</translate>
			</template>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./moderate-user-modal" />
