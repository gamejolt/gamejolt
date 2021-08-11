import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppGameListPlaceholder extends Vue {
	@Prop(Number) num!: number;
}
