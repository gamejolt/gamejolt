<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppProgressBar extends Vue {
	@Prop(Number)
	percent!: number;

	@Prop(Boolean)
	thin?: boolean;

	@Prop(Boolean)
	active?: boolean;

	@Prop(Boolean)
	indeterminate?: boolean;

	@Prop({ type: Boolean, default: true })
	animate!: boolean;
}
</script>

<template>
	<div
		class="progress"
		:class="[
			thin ? 'progress-thin' : undefined,
			indeterminate ? 'progress-striped' : undefined,
			active ? 'active' : undefined,
			animate ? 'animate' : undefined,
		]"
	>
		<div class="progress-bar" :style="{ width: Math.max(0, Math.min(100, percent)) + '%' }"></div>
		<div class="-text">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" src="./bar.styl" scoped></style>
