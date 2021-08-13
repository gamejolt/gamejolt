<script lang="ts" src="./edit-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-body">
			<form-fireside-edit :model="fireside" @submit="onFormSubmit" />

			<div class="-danger-zone well fill-offset">
				<h4 class="sans-margin-top">
					<translate>Extinguish Fireside</translate>
				</h4>
				<p class="help-block">
					<translate>
						Extinguishing your Fireside immediately closes it, skipping the time that is
						left. All current members will also have to go back home right away.
					</translate>
				</p>
				<app-button @click="onClickExtinguish()">
					<translate>Extinguish Fireside</translate>
				</app-button>
			</div>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
.-danger-zone
	margin-top: 24px
</style>
