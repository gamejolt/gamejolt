<script lang="ts" setup>
import AppModalWrapper from '~common/modal/AppModalWrapper.vue';
import { Modals } from '~common/modal/modal.service';

const { modals } = Modals;
</script>

<template>
	<div class="modals">
		<AppModalWrapper v-for="modal of modals" :key="modal.id" :modal="modal" />
	</div>
</template>

<style lang="stylus" scoped>
.modals
	position: relative
	z-index: $zindex-modal
</style>
