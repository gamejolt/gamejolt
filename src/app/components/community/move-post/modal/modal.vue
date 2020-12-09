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
			<app-community-move-post
				v-if="canMove"
				:fireside-post-community="firesidePostCommunity"
				:channels="channels"
				@select="onChannelSelected"
			/>
			<span v-else>
				<translate>
					There are no channels in this community that the post can be moved to.
				</translate>
			</span>
		</div>
	</app-modal>
</template>
