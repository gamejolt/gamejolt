<script lang="ts" src="./modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-body">
			<app-fireside-chat-members :chat-users="chatUsers" :chat-room="chatRoom" />
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped></style>
