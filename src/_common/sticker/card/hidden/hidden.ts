import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppStickerCardHidden extends Vue {
	@Prop({ type: Number, default: 0 }) count!: number;
	@Prop({ type: Boolean, default: false }) disabled!: boolean;
}
