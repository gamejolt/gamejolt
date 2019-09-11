import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
import AppFormTS from '../form';

@Component({})
export default class AppFormButton extends Vue {
	@Prop(Boolean) showWhenValid!: boolean;
	@Prop({ type: Boolean, default: true }) primary!: boolean;
	@Prop(Boolean) trans!: boolean;
	@Prop({ type: Boolean, default: true }) solid!: boolean;
	@Prop(Boolean) block!: boolean;
	@Prop(Boolean) lg!: boolean;
	@Prop(String) icon?: string;

	form!: AppFormTS;

	get shouldShow() {
		if (!this.showWhenValid) {
			return true;
		}

		return this.form.base.changed && this.form.base.valid;
	}

	created() {
		this.form = findRequiredVueParent(this, require('../form.vue').default) as AppFormTS;
	}

	// The app-button component used to automatically submit forms through
	// the native default behaviour of it's underlying <button> element.
	// (the <button> element's type attribute is considered to be 'submit' when unspecified),
	// so in places where we wanted to use app-button in forms without submitting the form
	// we'd add a @click.prevent on it.
	//
	// The problem with this is that if app-buttons are v-if'ed away in a transition,
	// they Vue vm for the elements is destroyed and all non native vue event handlers we set
	// on the element are unbound (including the @click.prevent) before the transition ends.
	// This means that during the time between the component being v-ifed away and the transition ending
	// clicks that happen on the component will not get prevented - resulting in the form being submitted.
	//
	// To fix this, we set the default behaviour of app-button to not submit the form, and set a NATIVE
	// click event handler on the app-form-button component to manually submit the form.
	async onClick(e: Event) {
		this.$emit('before-submit', e);
		if (e.defaultPrevented) {
			return;
		}

		const result = await this.form.submit();
		this.$emit('after-submit', e, result);
	}
}
