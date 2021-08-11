<script lang="ts" src="./install-package-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<app-jolticon icon="download-box" big />
				<translate>Choose a Package</translate>
			</h2>
		</div>

		<div class="modal-body">
			<p>
				<translate>
					This game has multiple installable packages. Please choose the one you'd like to
					install.
				</translate>
			</p>

			<app-loading v-if="isLoading" big />
			<template v-else-if="installablePackages.length">
				<app-game-package-card
					v-for="pkg of installablePackages"
					:key="pkg.id"
					:game="game"
					:sellable="pkg._sellable"
					:package="pkg"
					:releases="pkg._releases"
					:builds="pkg._builds"
				/>
			</template>
			<template v-else class="alert alert-notice">
				<translate>This game doesn't have any packages to install.</translate>
			</template>
		</div>
	</app-modal>
</template>
