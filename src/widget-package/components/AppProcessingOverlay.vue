<script lang="ts" setup>
import AppLoading from '../../_common/loading/AppLoading.vue';
import AppWidgetModal from './AppWidgetModal.vue';
</script>

<template>
	<AppWidgetModal class="text-center" hide-close style="z-index: 20">
		<br />
		<br />
		<AppLoading centered hide-label />
		<div>
			<strong>Processing... Hold on to your butts!</strong>
		</div>
	</AppWidgetModal>
</template>
