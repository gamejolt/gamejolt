import { Community } from '../../../../../../../_common/community/community.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppCommunitiesOverviewEditNotice extends Vue {
	@Prop(Community)
	community!: Community;
}
