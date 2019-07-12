import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppCommunitiesEditNotice extends Vue {
	@Prop(Community)
	community!: Community;
}
