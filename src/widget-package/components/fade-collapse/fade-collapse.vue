<script lang="ts">
import { nextTick } from 'vue';
import { Emit, Options, Vue } from 'vue-property-decorator';
import { Ruler } from '../../../_common/ruler/ruler-service';

@Options({})
export default class AppFadeCollapse extends Vue {
	height = 0;
	innerHeight = 0;
	isCollapsed = false;

	declare $el: HTMLElement;
	declare $refs: {
		inner: HTMLElement;
	};

	@Emit('required')
	emitRequired() {}

	async mounted() {
		await nextTick();
		this.height = Ruler.height(this.$el);
		this.innerHeight = Ruler.height(this.$refs.inner);

		if (this.innerHeight > this.height) {
			this.isCollapsed = true;
			this.emitRequired();
		}
	}
}
</script>

<template>
	<div class="-fade-collapse" :class="{ '-is-collapsed': isCollapsed }">
		<div ref="inner">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-fade-collapse
	position: relative
	overflow: hidden

	&::before
		position: absolute
		display: none
		content: ''
		bottom: 0
		left: 0
		right: 0
		height: 25px
		pointer-events: none
		z-index: 1

	// Light theme.
	.theme-light &
		&::before
			background-image: linear-gradient(to bottom, var(--theme-bg-offset-trans) 0, var(--theme-bg-offset) 100%)

	// Dark theme.
	.theme-dark &
		&::before
			background-image: linear-gradient(to bottom, var(--theme-darker-trans) 0, var(--theme-darker) 100%)

	&.-is-collapsed
		&::before
			display: block
</style>
