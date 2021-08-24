<script lang="ts" src="./share"></script>

<template>
	<app-share-card
		v-if="useShareCard"
		class="-share-card"
		resource="fireside"
		:url="shareUrl"
		:hide-heading="hideHeading"
		offset-color
	/>
	<app-card v-else class="-share-card">
		<p>
			<translate>Share this Fireside</translate>
		</p>
		<div class="-copy-controls">
			<input class="form-control" :value="shareUrl" />
			<app-button trans @click="copyShareUrl">
				<translate>Copy</translate>
			</app-button>
		</div>
	</app-card>
</template>

<style lang="stylus" scoped>
.-share-card
	margin-bottom: 0px
	margin-top: 20px

.-copy-controls
	display: flex

	> input
		margin-right: 8px
</style>
