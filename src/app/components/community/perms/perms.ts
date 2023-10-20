import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Perm } from '../../../../_common/collaborator/collaboratable';
import { CommunityModel } from '../../../../_common/community/community.model';

@Options({})
export class AppCommunityPerms extends Vue {
	@Prop({ type: Object, required: true }) community!: CommunityModel;
	@Prop({ type: String, default: '' }) required!: string;
	@Prop({ type: Boolean, default: false }) either!: boolean;
	@Prop({ type: String, default: 'span' }) tag!: string;

	get hasPerms() {
		const perms = this.required.split(',') as Perm[];

		return this.community.hasPerms(
			perms.filter(perm => !!perm),
			this.either
		);
	}

	render() {
		if (this.hasPerms) {
			return h(this.tag, {}, this.$slots.default?.());
		}
	}
}
