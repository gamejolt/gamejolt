<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				{{ package.title || game.title }}
			</h2>
		</div>

		<div class="modal-body">
			<form-game-package-payment
				:game="game"
				:package="package"
				:build="build"
				:sellable="sellable"
				:partner-key="partnerKey"
				:partner="partner"
				:operation="operation"
				@bought="bought"
				@skip="skipPayment"
			/>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./purchase-modal"></script>
