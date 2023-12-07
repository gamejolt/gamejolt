<script lang="ts" setup>
import { DeepReadonly, PropType } from 'vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppUserCard from '../../../../../_common/user/card/AppUserCard.vue';
import { ReportComponent } from '../../../../components/site-analytics/site-analytics-service';

defineProps({
	reportData: {
		type: Object as PropType<DeepReadonly<ReportComponent>>,
		required: true,
	},
});
</script>

<template>
	<div class="col-sm-12">
		<div v-if="!reportData.hasData" class="alert">
			<AppTranslate>No data.</AppTranslate>
		</div>
		<div v-else class="-list">
			<div v-for="(val, i) of reportData.data" :key="i">
				<AppUserCard :user="val.label.gathers.user" elevate />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-list
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))
	grid-gap: 0px 16px
</style>
