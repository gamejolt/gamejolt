<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Rename Channel</translate>
			</h2>
		</div>
		<div class="modal-body">
			<div class="-notice">
				<span v-translate>
					Renaming a channel changes the <em>url</em> of that channel.
				</span>
			</div>
			<form-community-channel
				:model="channel"
				:community="community"
				:channels="channels"
				@submit="onSubmit"
			/>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-notice
	em
		font-style: normal
		font-weight: bold
		color: var(--theme-notice)
</style>

<script lang="ts" src="./rename-modal"></script>
