<script lang="ts" setup>
import { Environment } from '~common/environment/environment.service';
import { SellableModel } from '~common/sellable/sellable.model';

type Props = {
	sellables?: SellableModel[];
	theme?: string;
};
const { sellables = [], theme = 'dark' } = defineProps<Props>();
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
