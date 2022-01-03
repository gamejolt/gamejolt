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
				<translate :translate-params="{ title: channel.title }">
					Remove "%{ title }" channel?
				</translate>
			</h2>
		</div>

		<div class="modal-body">
			<template v-if="channel.type === 'competition'">
				<div class="alert">
					<h4 class="sans-margin-top"><translate>Removing a Jam Channel</translate></h4>
					<p>
						<span v-translate>
							This channel contains a <b>Jam</b>, which gets removed when this channel
							gets removed. That includes all entries, votes, awards and results that
							belong to the jam.
						</span>
					</p>
					<p>
						<span v-translate class="-jam-warning">
							<b>This action is irreversible!</b>
						</span>
					</p>
				</div>
			</template>

			<app-community-remove-channel
				:community="community"
				:channel="channel"
				@removed="onRemoved"
			/>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
.-jam-warning
	display: inline-block
	padding: 4px
	rounded-corners()
	background-color: var(--theme-notice)
	color: var(--theme-notice-fg)
	margin-top: 4px
</style>
