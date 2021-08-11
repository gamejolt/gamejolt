import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';

@Options({})
export default class AppStickerCardHidden extends Vue {
	@Prop(propOptional(Number, 0)) count!: number;
	@Prop(propOptional(Boolean, false)) disabled!: boolean;
}
