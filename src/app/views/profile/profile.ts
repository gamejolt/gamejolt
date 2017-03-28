import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./profile.html?style=./profile.styl';

import { UserFriendship } from '../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { AppState } from '../../../lib/gj-lib-client/vue/services/app/app-store';
import { BeforeRouteEnter } from '../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { MediaItem } from '../../../lib/gj-lib-client/components/media-item/media-item-model';
import { AppPageHeader } from '../../components/page-header/page-header';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTimeAgo } from '../../../lib/gj-lib-client/components/time/ago/ago';
import { AppTooltip } from '../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppUserAvatar } from '../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppPopover } from '../../../lib/gj-lib-client/components/popover/popover';
import { AppPopoverTrigger } from '../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { AppUserDogtag } from '../../components/user/dogtag/dogtag';

@View
@Component({
	name: 'route-profile',
	components: {
		AppPageHeader,
		AppJolticon,
		AppTimeAgo,
		AppUserAvatar,
		AppUserDogtag,
		AppPopover,
	},
	directives: {
		AppTooltip,
		AppPopoverTrigger,
	},
})
export default class RouteProfile extends Vue
{
	@Prop( String ) username: string;

	@State app: AppState;

	user: User | null = null;
	headerMediaItem: MediaItem | null = null;
	gamesCount = 0;
	videosCount = 0;
	isOnline = false;
	libraryGamesCount = 0;
	// activeGameSession: any;
	userFriendship: UserFriendship | null = null;

	UserFriendship = UserFriendship;
	Environment = Environment;

	@BeforeRouteEnter()
	routeEnter( this: undefined, route: VueRouter.Route )
	{
		return Api.sendRequest( '/web/profile/@' + route.params.username );
	}

	routed()
	{
		this.user = new User( this.$payload.user );

		// TODO
		// Location.enforce( {
		// 	slug: this.user.slug,
		// } );

		this.headerMediaItem = this.$payload.headerMediaItem ? new MediaItem( this.$payload.headerMediaItem ) : null;
		this.gamesCount = this.$payload.gamesCount;
		this.isOnline = this.$payload.isOnline;
		this.libraryGamesCount = this.$payload.libraryGamesCount;
		// TODO
		// this.activeGameSession = this.$payload.activeGameSession ? new userGameSession( this.$payload.activeGameSession ) : null;
		this.videosCount = this.$payload.videosCount || 0;

		if ( this.$payload.userFriendship ) {
			this.userFriendship = new UserFriendship( this.$payload.userFriendship );
		}
	}

	acceptFriendRequest()
	{
		// TODO
		// this.userFriendshipsHelper.acceptRequest( this.userFriendship );
	}

	sendFriendRequest()
	{
		// TODO
		// this.userFriendshipsHelper.sendRequest( this.user )
		// 	.then( ( request: any ) =>
		// 	{
		// 		this.userFriendship = request;
		// 	} );
	}

	cancelFriendRequest()
	{
		// TODO
		// this.userFriendshipsHelper.cancelRequest( this.userFriendship )
		// 	.then( () =>
		// 	{
		// 		this.userFriendship = undefined;
		// 	} );
	}

	rejectFriendRequest()
	{
		// TODO
		// this.userFriendshipsHelper.rejectRequest( this.userFriendship )
		// 	.then( () =>
		// 	{
		// 		this.userFriendship = undefined;
		// 	} );
	}

	removeFriend()
	{
		// TODO
		// this.userFriendshipsHelper.removeFriend( this.userFriendship )
		// 	.then( () =>
		// 	{
		// 		this.userFriendship = undefined;
		// 	} );
	}

	report()
	{
		// TODO
		// this.reportModal.show( this.user );
	}
}
