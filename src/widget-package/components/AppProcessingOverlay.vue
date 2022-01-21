<script lang="ts" setup>
import AppLoading from '../../_common/loading/loading.vue';
import AppModal from './AppModal.vue';
</script>

<template>
	<AppModal class="text-center" hide-close style="z-index: 20">
		<br />
		<br />
		<AppLoading centered hide-label />
		<div>
			<strong>Processing... Hold on to your butts!</strong>
		</div>
	</AppModal>
</template>
