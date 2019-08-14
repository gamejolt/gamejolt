import { createTextMaskInputElement } from 'text-mask-core/dist/textMaskCore';
import { Component, Prop } from 'vue-property-decorator';
import BaseFormControl from './base';

@Component({})
export default class AppFormControl extends BaseFormControl {
	@Prop({ type: String, default: 'text' })
	type!: string;

	@Prop(Array) validateOn!: string[];
	@Prop(Number) validateDelay!: number;
	@Prop(Array) mask!: (string | RegExp)[];

	controlVal = '';
	maskedInputElem: any = null;

	$el!: HTMLInputElement;

	get controlType() {
		if (this.type === 'currency') {
			return 'number';
		}
		return this.type;
	}

	get validationRules() {
		const rules = {
			...this.baseRules,
		};

		if (this.type === 'currency') {
			rules.decimal = 2;
		}

		if (this.type === 'email') {
			rules.email = true;
		}

		return rules;
	}

	mounted() {
		const mask = this.mask;
		if (mask) {
			this.maskedInputElem = createTextMaskInputElement({
				inputElement: this.$el,
				mask,
			});
			this.maskedInputElem.update(this.controlVal);
		}
	}

	onChange() {
		if (this.maskedInputElem) {
			this.maskedInputElem.update(this.$el.value);
		}

		this.applyValue(this.$el.value);
	}
}
