import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppStore } from '../../../vue/services/app/app-store';
import { Screen } from '../../screen/screen-service';
import AppTimelineListItem from '../../timeline-list/item/item.vue';
import AppUserAvatarImg from '../../user/user-avatar/img/img.vue';

@Component({
	components: {
		AppUserAvatarImg,
		AppTimelineListItem,
	},
})
export default class AppMessageThreadAdd extends Vue {
	@Prop(Boolean) hideMessageSplit!: boolean;

	@State app!: AppStore;

	readonly Screen = Screen;
}
