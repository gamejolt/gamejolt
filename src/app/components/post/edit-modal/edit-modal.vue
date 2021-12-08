<script lang="ts" src="./edit-modal"></script>

<template>
	<app-modal ignore-router>
		<div class="modal-controls">
			<app-button :disabled="closeButtonDisabled" @click="modal.dismiss()">
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
					@route-change="onRouteChange"
					@submit="onSubmitted"
					@video-upload-status-change="onVideoUploadStatusChanged"
				/>
			</app-loading-fade>
		</div>
	</app-modal>
</template>
