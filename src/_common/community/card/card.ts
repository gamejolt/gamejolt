import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { number } from '../../filters/number';
import { AppTheme } from '../../theme/theme';
import { Community } from '../community.model';
import AppCommunityThumbnailImg from '../thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../verified-tick/verified-tick.vue';

@Component({
	components: {
		AppCommunityThumbnailImg,
		AppTheme,
		AppCommunityVerifiedTick,
	},
})
export default class AppCommunityCard extends Vue {
	@Prop(Community)
	community!: Community;

	readonly number = number;

	get memberCount() {
		return this.community.member_count || 0;
	}

	get headerBackgroundImage() {
		return this.community.header
			? `url('${this.community.header.mediaserver_url}')`
			: undefined;
	}
}
