import { Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../../../../_common/card/card.vue';
import { number } from '../../../../_common/filters/number';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';

@Options({
	components: {
		AppCard,
		AppProgressBar,
	},
	filters: {
		number,
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

	number = number;

	get completionRate() {
		return Math.ceil((this.achieved / this.total) * 100);
	}
}
