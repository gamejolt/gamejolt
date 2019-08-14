import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
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

	onClick(e: Event) {
		this.$emit('click', e);
	}
}
