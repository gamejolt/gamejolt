import { ResizeObserver } from 'resize-observer';
import { createTextMaskInputElement } from 'text-mask-core/dist/textMaskCore';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Ruler } from '../../../ruler/ruler-service';
import BaseFormControl from '../base';

@Component({})
export default class AppFormControlPrefixedInput extends BaseFormControl {
	@Prop({ type: String, default: 'text' })
	type!: 'text' | 'password' | 'email' | 'number' | 'search' | 'url';

	@Prop(String)
	prefix?: string;

	@Prop({ type: Boolean, default: false })
	disabled!: boolean;

	@Prop(Array) validateOn!: string[];
	@Prop(Number) validateDelay!: number;
	@Prop(Array) mask!: (string | RegExp)[];

	controlVal = '';
	maskedInputElem: any = null;

	originalInputPaddingTop = 0;
	originalInputPaddingLeft = 0;
	originalInputMarginTop = 0;
	originalInputMarginLeft = 0;

	resizeObserver: ResizeObserver | null = null;

	$refs!: {
		input: HTMLInputElement;
		prefix: HTMLSpanElement;
	};

	$el!: HTMLInputElement;

	mounted() {
		const mask = this.mask;
		if (mask) {
			this.maskedInputElem = createTextMaskInputElement({
				inputElement: this.$el,
				mask,
			});
			this.maskedInputElem.update(this.controlVal);
		}

		const styles = window.getComputedStyle(this.$refs.input);
		this.originalInputPaddingTop = parseFloat(styles.paddingTop || '0');
		this.originalInputPaddingLeft = parseFloat(styles.paddingLeft || '0');
		this.originalInputMarginTop = parseFloat(styles.marginTop || '0');
		this.originalInputMarginLeft = parseFloat(styles.marginLeft || '0');

		this.resizeObserver = new ResizeObserver(() => {
			this.recalcPositioning();
		});
		this.resizeObserver.observe(this.$refs.prefix);

		this.recalcPositioning();
	}

	onChange() {
		if (this.maskedInputElem) {
			this.maskedInputElem.update(this.$el.value);
		}

		this.applyValue(this.$el.value);
	}

	beforeDestroy() {
		if (this.resizeObserver instanceof ResizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
	}

	@Watch('prefix')
	async recalcPositioning() {
		const originalOffsetTop = this.originalInputPaddingTop + this.originalInputMarginTop;
		const originalOffsetLeft = this.originalInputPaddingLeft + this.originalInputMarginLeft;

		this.$refs.prefix.style.top = `${originalOffsetTop}px`;
		this.$refs.prefix.style.left = `${originalOffsetLeft}px`;

		const offsetLeft = Ruler.outerWidth(this.$refs.prefix) + originalOffsetLeft;
		this.$refs.input.style.paddingLeft = `${offsetLeft}px`;
	}
}
