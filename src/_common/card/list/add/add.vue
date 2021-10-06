<script lang="ts" src="./add"></script>

<template>
	<div class="card-list-item card-list-add" :class="{ active: isActive }">
		<app-button primary block :solid="isActive" :icon="icon" @click="toggle">
			{{ label }}
		</app-button>

		<div class="card-list-item-body full-bleed-xs">
			<app-expand :when="isActive">
				<div class="well fill-offset" :class="{ 'well-row': Screen.isXs }">
					<slot />
				</div>
			</app-expand>
		</div>
	</div>
</template>

<style lang="stylus" src="../list-common.styl" scoped></style>
