import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityChannelDescription from '../../channel/description/description.vue';
import AppCommunityCompetitionCountdown from '../countdown/countdown.vue';

@Component({
	components: {
		AppCommunityChannelDescription,
		AppCommunityCompetitionCountdown,
	},
})
export default class AppCommunityCompetitionSidebar extends Vue {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propRequired(CommunityChannel)) channel!: CommunityChannel;
}
