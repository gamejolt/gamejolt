import { Emit, Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppSearchInput extends Vue {
	@Prop({ type: String, required: true })
	modelValue!: string;

	@Emit('update:modelValue')
	emitUpdate(_modelValue: string) {}

	focus() {
		(this.$el as HTMLElement).focus();
	}

	blur() {
		(this.$el as HTMLElement).blur();
	}

	onChange(val: string) {
		this.emitUpdate(val);
	}
}
