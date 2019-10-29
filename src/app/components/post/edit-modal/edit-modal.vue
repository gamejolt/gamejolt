<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<app-loading-fade :is-loading="!post">
				<app-post-add-placeholder v-if="!post" />
				<form-post
					v-else
					:model="post"
					:default-community="community"
					:default-channel="channel"
					@submit="onSubmitted"
				/>
			</app-loading-fade>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./edit-modal"></script>
