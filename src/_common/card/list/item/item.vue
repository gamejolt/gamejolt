<script lang="ts" src="./item"></script>

<template>
	<div class="card-list-item" :class="{ active: isActive }">
		<app-card
			:is-expandable="isExpandable"
			:is-expanded="isActive"
			:is-draggable="isDraggable"
			:force-expandable-padding="forceExpandablePadding"
			@click.native="onClick"
		>
			<div v-if="isDraggable" class="card-drag-handle">
				<app-jolticon icon="arrows-v" />
			</div>
			<slot />
		</app-card>

		<div class="card-list-item-body full-bleed-xs">
			<app-expand :when="isActive">
				<div class="well fill-offset" :class="{ 'well-row': Screen.isXs }">
					<slot name="body" />
				</div>
			</app-expand>
		</div>
	</div>
</template>

<style lang="stylus" src="../list-common.styl" scoped></style>
