<script lang="ts" setup>
import { PropType } from 'vue';
import { Environment } from '../../environment/environment.service';
import { SellableModel } from '../../sellable/sellable.model';

defineProps({
	sellables: {
		type: Array as PropType<SellableModel[]>,
		default: () => [],
	},
	theme: {
		type: String,
		default: 'dark',
	},
});
</script>

<template>
	<div class="widget-compiler-widget-game-packages">
		<div v-for="sellable of sellables" :key="sellable.id">
			<iframe
				nwdisable
				nwfaketop
				:src="`${Environment.widgetHost}/sale/v1?key=${sellable.key}&theme=${theme}`"
				frameborder="0"
				width="100%"
				height="245"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.widget-compiler-widget-game-packages
	max-width: 500px
	margin: 0 auto

	iframe
		margin-bottom: $line-height-computed
</style>
