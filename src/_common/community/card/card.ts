import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { number } from '../../filters/number';
import { AppStore } from '../../store/app-store';
import { AppTheme } from '../../theme/theme';
import { Community } from '../community.model';
import AppCommunityJoinWidget from '../join-widget/join-widget.vue';
import AppCommunityThumbnailImg from '../thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../verified-tick/verified-tick.vue';

@Component({
	components: {
		AppCommunityThumbnailImg,
		AppTheme,
		AppCommunityVerifiedTick,
		AppCommunityJoinWidget,
	},
})
export default class AppCommunityCard extends Vue {
	@Prop(Community)
	community!: Community;

	@State
	app!: AppStore;

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
