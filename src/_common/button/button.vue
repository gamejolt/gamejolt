<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppButton extends Vue {
	@Prop({ type: String, default: 'button' })
	tag!: string;
	@Prop(Boolean) primary?: boolean;
	@Prop(Boolean) trans?: boolean;
	@Prop(Boolean) solid?: boolean;
	@Prop(Boolean) overlay?: boolean;
	@Prop(Boolean) sparse?: boolean;
	@Prop(Boolean) circle?: boolean;
	@Prop(Boolean) disabled?: boolean;
	@Prop(Boolean) lg?: boolean;
	@Prop(Boolean) sm?: boolean;
	@Prop(Boolean) block?: boolean;
	@Prop(Boolean) blockXs?: boolean;
	@Prop(String) icon?: string;
	@Prop(String) badge?: string;
	@Prop() to?: any;

	get ourTag() {
		if (this.$attrs.href) {
			return 'a';
		} else if (this.to) {
			return 'router-link';
		}
		return this.tag;
	}
}
</script>

<template>
	<component
		:is="ourTag"
		type="button"
		class="button"
		:class="{
			'-primary': primary,
			'-trans': trans,
			'-outline': !solid,
			'-overlay': overlay,
			'-circle': circle,
			'-sparse': sparse || circle,
			'-lg': lg,
			'-sm': sm,
			'-block': block,
			'-block-xs': blockXs,
			'-disabled': disabled,
		}"
		:to="to"
		:disabled="disabled === true ? 'disabled' : null"
	>
		<span v-if="badge" class="-badge">{{ badge }}</span>
		<app-jolticon v-if="icon" class="-icon" :icon="icon" :big="lg" />
		<slot />
	</component>
</template>

<style lang="stylus" src="./button.styl" scoped></style>
