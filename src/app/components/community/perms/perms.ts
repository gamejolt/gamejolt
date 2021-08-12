import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../utils/vue';
import { Perm } from '../../../../_common/collaborator/collaboratable';
import { Community } from '../../../../_common/community/community.model';

@Options({})
export class AppCommunityPerms extends Vue {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propOptional(String, '')) required!: string;
	@Prop(propOptional(Boolean, false)) either!: boolean;
	@Prop(propOptional(String, 'span')) tag!: string;

	get hasPerms() {
		const perms = this.required.split(',') as Perm[];

		return this.community.hasPerms(
			perms.filter(perm => !!perm),
			this.either
		);
	}

	render() {
		if (this.hasPerms) {
			return h(this.tag, {}, this.$slots.default);
		}
	}
}
