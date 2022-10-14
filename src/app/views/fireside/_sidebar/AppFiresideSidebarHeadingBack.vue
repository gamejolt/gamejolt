<script lang="ts" setup>
import AppButton from '../../../../_common/button/AppButton.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';

const { sidebarHome, isSidebarHome, setSidebar } = useFiresideController()!;
</script>

<template>
	<AppButton
		v-if="!isSidebarHome"
		circle
		sparse
		trans
		icon="chevron-left"
		@click="setSidebar(sidebarHome, 'sidebar-heading-back')"
	/>
</template>
