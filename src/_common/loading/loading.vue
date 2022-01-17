<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { WithSSRContextFilepath } from '../route/route-component';

const images = import.meta.globEager('./*.gif');

@Options({})
@WithSSRContextFilepath('_common/loading/loading.vue')
export default class AppLoading extends Vue {
	@Prop({ type: String, default: 'Loading...' })
	label!: string;
	@Prop(Boolean) hideLabel!: boolean;
	@Prop(Boolean) big!: boolean;
	@Prop(Boolean) noColor!: boolean;
	@Prop(Boolean) stationary!: boolean;
	@Prop(Boolean) centered!: boolean;

	get img() {
		const img =
			'loading' +
			(this.stationary ? '-stationary' : '') +
			(this.noColor ? '-bw' : '') +
			(this.big ? '-2x' : '');

		return images[`./${img}.gif`].default;
	}
}
</script>

<template>
	<div
		class="loading"
		:class="{
			'loading-big': big,
			'loading-stationary': stationary,
			'loading-bw': noColor,
			'loading-centered': centered,
		}"
	>
		<img :src="img" alt="Loading" title="Loading..." />
		<span class="loading-label" :class="{ 'sr-only': hideLabel }">
			{{ label }}
		</span>
	</div>
</template>

<style lang="stylus" src="./loading.styl" scoped></style>
