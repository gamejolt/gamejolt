<template>
	<div class="base-content-component">
		<div v-if="isEditing" class="-controls theme-dark">
			<app-button
				v-if="showEdit"
				circle
				overlay
				icon="edit"
				:disabled="isDisabled"
				@click="onEditClicked"
			/>
			<app-button
				circle
				overlay
				icon="remove"
				:disabled="isDisabled"
				@click="onRemovedClicked"
			/>
		</div>

		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.base-content-component
	position: relative
	white-space: normal

	.-controls
		z-index: 10
		position: absolute
		top: 4px
		right: 4px
</style>

<script lang="ts" src="./base-content-component"></script>
