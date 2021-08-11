<script lang="ts" src="./modals"></script>

<template>
	<div class="modals">
		<app-modal-wrapper v-for="(modal, index) of Modal.modals" :key="index" :modal="modal" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.modals
	position: relative
	z-index: $zindex-modal
</style>
