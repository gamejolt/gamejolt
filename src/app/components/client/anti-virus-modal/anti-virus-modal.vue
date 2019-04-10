<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 v-if="title" class="modal-title">
				{{ title }}
			</h2>

			<p>
				<strong>{{ message }}</strong>
			</p>
		</div>

		<div class="modal-body">
			<p>
				<translate>
					Looks like your anti-virus program removed an executable we need to manage your game
					library.
				</translate>
			</p>

			<p>
				<translate>
					Sadly, it's common for anti-virus programs to quarantine legitimate programs like the
					Client that require access to your file system.
				</translate>
			</p>

			<p>
				<translate>
					There should be a way to mark the Client as trusted in your anti-virus program to restore
					functionality of the Client.
				</translate>
			</p>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./anti-virus-modal"></script>
