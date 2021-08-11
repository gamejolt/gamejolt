import { Sketch } from 'vue-color';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Popper } from '../popper/popper.service';
import AppPopper from '../popper/popper.vue';

@Options({
	components: {
		picker: Sketch,
		AppPopper,
	},
})
export default class AppColorpicker extends Vue {
	@Prop({ type: String, required: true })
	modelValue!: string;

	colors: any = {};

	@Emit('update:modelValue')
	emitUpdate(_modelValue: string) {}

	@Watch('modelValue', { immediate: true })
	onValueChanged() {
		this.colors = {
			hex: this.modelValue,
		};
	}

	onChange(value: any) {
		this.colors = value;
	}

	accept() {
		this.emitUpdate(this.colors.hex);
		Popper.hideAll();
	}

	cancel() {
		this.colors = {
			hex: this.modelValue,
		};
		Popper.hideAll();
	}
}
