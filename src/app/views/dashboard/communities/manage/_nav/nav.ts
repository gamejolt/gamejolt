import View from '!view!./nav.html?style=./nav.styl';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import { RouteStore, RouteStoreModule } from '../manage.store';
import { AppManageCommunityNavRequired } from './required';

@View
@Component({
	components: {
		AppManageCommunityNavRequired,
		AppCommunityPerms,
	},
})
export class AppManageCommunityNav extends Vue {
	@RouteStoreModule.State
	community!: RouteStore['community'];

	@RouteStoreModule.State
	isWizard!: RouteStore['isWizard'];

	@RouteStoreModule.State
	canPublish!: RouteStore['canPublish'];

	@RouteStoreModule.Action
	saveDraft!: RouteStore['saveDraft'];

	@RouteStoreModule.Action
	publish!: RouteStore['publish'];

	@State
	app!: AppStore;

	Community = Community;
}
