<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<form-game-package
				:model="gamePackage"
				:game="game"
				:sellable="sellable"
				@submit="onSubmitted"
			/>
			<!-- @salecanceled="onEdited" -->
		</div>
	</app-modal>
</template>

<script lang="ts" src="./edit-modal"></script>
