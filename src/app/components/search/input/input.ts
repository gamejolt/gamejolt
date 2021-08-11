import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppSearchInput extends Vue {
	@Prop(String) value!: string;

	focus() {
		(this.$el as HTMLElement).focus();
	}

	blur() {
		(this.$el as HTMLElement).blur();
	}

	onChange(val: string) {
		this.$emit('input', val);
	}
}
