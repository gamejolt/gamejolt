<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppPill extends Vue {
	@Prop({ type: Object, required: false })
	to?: any;

	@Emit('click')
	emitClick(_e: MouseEvent) {}

	get component() {
		if (this.to) {
			return 'router-link';
		}

		if (this.hasClickListener) {
			return 'a';
		}

		return 'div';
	}

	get hasImg() {
		// TODO(vue3): check
		return !!this.$slots.img;
	}

	get hasClickListener() {
		return !!this.$attrs.onClick;
	}

	onClick(e: MouseEvent) {
		if (this.component === 'div') {
			return;
		}

		this.emitClick(e);
	}
}
</script>

<template>
	<component :is="component" class="pill" :to="to" @click="onClick">
		<span class="-img" v-if="hasImg">
			<slot name="img" />
		</span>
		<span class="-content">
			<slot />
		</span>
	</component>
</template>

<style lang="stylus" scoped>
.pill
	rounded-corners()
	change-bg('bg-offset')
	theme-prop('color', 'fg')
	display: inline-flex
	align-items: center
	padding: 5px 10px
	font-size: $font-size-small
	user-select: none
	margin-right: 5px
	margin-bottom: 5px

	&.active
		change-bg('bi-bg')
		theme-prop('color', 'bi-fg')

	a&
		pressy()
		cursor: pointer

		&:hover
			change-bg('bi-bg')
			theme-prop('color', 'bi-fg')

.-img
	img-circle()
	overflow: hidden
	margin-right: 5px
	width: 18px
	height: 18px
</style>
