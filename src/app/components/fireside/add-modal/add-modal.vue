<script lang="ts" src="./add-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<small>
					<translate>Stoke the Flames</translate>
				</small>
				<br />
				<template v-if="community">
					<translate>Start your Community's Fireside</translate>
				</template>
				<template v-else>
					<translate>Start your Fireside</translate>
				</template>
			</h2>
		</div>
		<div class="modal-body">
			<app-loading v-if="isLoading" centered />
			<form-fireside-add v-else :default-title="defaultTitle" @submit="onSubmit" />
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped></style>
