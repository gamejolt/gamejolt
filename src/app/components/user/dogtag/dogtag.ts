import { Options, Prop, Vue } from 'vue-property-decorator';
import './dogtag.styl';

@Options({})
export default class AppUserDogtag extends Vue {
	@Prop(String) type!: string;
}
