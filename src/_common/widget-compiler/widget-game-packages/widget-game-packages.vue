<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Environment } from '../../environment/environment.service';
import { SellableModel } from '../../sellable/sellable.model';

@Options({})
export default class AppWidgetCompilerWidgetGamePackages extends Vue {
	@Prop({ type: Array, default: () => [] })
	sellables!: SellableModel[];
	@Prop({ type: String, default: 'dark' })
	theme!: string;

	widgetHost = Environment.widgetHost;
}
</script>

<template>
	<div class="widget-compiler-widget-game-packages">
		<div v-for="sellable of sellables" :key="sellable.id">
			<iframe
				nwdisable
				nwfaketop
				:src="`${widgetHost}/sale/v1?key=${sellable.key}&theme=${theme}`"
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
