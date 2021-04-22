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
				<translate>Which channel to move to?</translate>
			</h2>
		</div>

		<div class="modal-body">
			<template v-if="canMove">
				<app-community-channel-select
					v-model="selectedChannel"
					class="-channel-select"
					:channels="selectableChannels"
				/>

				<form-community-move-post
					v-if="shouldShowForm"
					:community="firesidePostCommunity.community"
					@change="onChangeForm"
				/>

				<app-button
					primary
					icon="arrow-forward"
					:disabled="!hasSelectedChannel"
					@click="onMove"
				>
					<translate>Move</translate>
				</app-button>
			</template>
			<span v-else>
				<translate>
					There are no channels in this community that the post can be moved to.
				</translate>
			</span>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-channel-select
	margin-bottom: $line-height-computed
</style>
