import { Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../../../../_common/card/card.vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';

@Options({
	components: {
		AppCard,
		AppProgressBar,
	},
})
export default class AppTrophyCompletion extends Vue {
	@Prop(Number)
	total!: number;

	@Prop(Number)
	achieved!: number;

	@Prop(Number)
	experience!: number;

	@Prop({ type: Boolean, default: true })
	isLoggedInUser!: boolean;

	readonly number = formatNumber;

	get completionRate() {
		return Math.ceil((this.achieved / this.total) * 100);
	}
}
