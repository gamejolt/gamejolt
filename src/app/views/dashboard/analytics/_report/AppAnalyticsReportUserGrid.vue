<script lang="ts" setup>
import { DeepReadonly } from 'vue';

import { ReportComponent } from '~app/components/site-analytics/site-analytics-service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import AppUserCard from '~common/user/card/AppUserCard.vue';

type Props = {
	reportData: DeepReadonly<ReportComponent>;
};
defineProps<Props>();
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
