<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppToast extends Vue {
	@Prop(String) type!: string;

	timeout?: number;

	@Emit('dismiss')
	emitDismiss() {}

	mounted() {
		if (!this.type) {
			this.type = 'info';
		}
		this.setTimer();
	}

	focus() {
		this.clear();
	}

	blur() {
		this.setTimer();
	}

	dismiss() {
		this.emitDismiss();
		this.clear();
	}

	private setTimer() {
		this.timeout = window.setTimeout(() => this.dismiss(), 3000);
	}

	private clear() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
	}
}
</script>

<template>
	<div
		class="-toast"
		:class="{
			'fill-pink': type === 'error',
		}"
		@mouseenter="focus"
		@mouseleave="blur"
	>
		<a class="-close" @click="dismiss">
			<app-jolticon icon="remove" />
		</a>
		<app-jolticon v-if="type === 'error'" icon="notice" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-toast
	rounded-corners()
	position: absolute
	bottom: 0
	left: $shell-padding * 2
	right: @left
	padding: 7px 10px
	z-index: 1000

.-close
	float: right
	margin-left: 10px
</style>
