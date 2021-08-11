
<script lang="ts" src="./modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<translate> Share </translate>
			</h2>
		</div>

		<div class="modal-body">
			<div class="-grid">
				<template v-for="i in Providers">
					<app-share-card-tile
						:key="i"
						class="-tile"
						:model="model"
						:location="location"
						:provider="i"
					/>
				</template>
			</div>

			<app-button class="-copy" @click="copyLink()">
				<translate>Copy Link</translate>
			</app-button>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

$-icon-size = 32px
$-base-padding = 8px

.modal-body
	display: flex
	flex-direction: column

.-grid
	display: grid
	grid-template-columns: 1fr 1fr
	grid-gap: $-base-padding
	margin-bottom: 24px

.-tile
	rounded-corners-lg()
	justify-content: flex-start
	padding: $-base-padding
</style>
