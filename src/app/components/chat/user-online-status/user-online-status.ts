import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';

@Options({})
export default class AppChatUserOnlineStatus extends Vue {
	@Prop({ type: Boolean, required: true }) isOnline!: boolean;
	@Prop(propOptional(Number, null)) size!: number | null;
	@Prop(propOptional(Boolean, true)) absolute!: boolean;

	get outerSize() {
		if (!this.size || typeof this.size !== 'number') {
			return '12px';
		}

		return this.size + 'px';
	}

	get innerSize() {
		if (!this.size || typeof this.size !== 'number') {
			return '4px';
		}

		return Math.ceil(this.size / 3) + 'px';
	}
}
