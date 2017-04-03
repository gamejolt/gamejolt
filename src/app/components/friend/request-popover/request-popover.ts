import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./request-popover.html';

import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppCard } from '../../../../lib/gj-lib-client/components/card/card';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { UserFriendship } from '../../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppState } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { UserFriendshipHelper } from '../../user/friendships-helper/friendship-helper.service';
import { AppUserAvatarImg } from '../../../../lib/gj-lib-client/components/user/user-avatar/img/img';

const COUNT_INTERVAL = (5 * 60 * 1000);  // 5 minutes.
const INITIAL_LAG = 3000;

type Tab = 'requests' | 'pending';

@View
@Component({
	components: {
		AppPopover,
		AppLoading,
		AppCard,
		AppJolticon,
		AppUserAvatarImg,
	},
	directives: {
		AppTooltip,
	}
})
export class AppFriendRequestPopover extends Vue
{
	@State app: AppState;

	private isShown = false;
	private isLoading = true;

	private activeTab: Tab = 'requests';
	private requests: any[] = [];
	private requestsCount = 0;
	private pending: any[] = [];
	private countInterval: NodeJS.Timer;

	mounted()
	{
		// Fetch count right away.
		setTimeout( () => this.fetchCount(), INITIAL_LAG );

		// Fetch counts every X minutes afterwards.
		this.countInterval = setInterval( () => this.fetchCount(), COUNT_INTERVAL );
	}

	destroyed()
	{
		clearInterval( this.countInterval );
	}

	onFocus()
	{
		this.isShown = true;
		this.fetchRequests();
		this.$emit( 'focused' );
	}

	onBlur()
	{
		this.isShown = false;
		this.$emit( 'blurred' );
	}

	private setCount( count: number )
	{
		this.requestsCount = count;
		this.$emit( 'count', this.requestsCount );
	}

	async fetchCount()
	{
		const response = await UserFriendship.fetchCount();
		this.setCount( response.requestCount );
	}

	async fetchRequests()
	{
		const response = await UserFriendship.fetchRequests();
		this.requests = response.requests;
		this.setCount( this.requests.length );
		this.pending = response.pending;
		this.isLoading = false;
	}

	setActiveTab( tab: Tab )
	{
		this.activeTab = tab;
	}

	async acceptRequest( request: UserFriendship )
	{
		await UserFriendshipHelper.acceptRequest( request );
		this.removeRequest( request );
	}

	async rejectRequest( request: UserFriendship )
	{
		if ( !await UserFriendshipHelper.rejectRequest( request ) ) {
			return;
		}
		this.removeRequest( request );
	}

	async cancelRequest( request: UserFriendship )
	{
		if ( !await UserFriendshipHelper.cancelRequest( request ) ) {
			return;
		}
		this.removeRequest( request );
	}

	private removeRequest( request: UserFriendship )
	{
		const index = this.requests.findIndex( ( item ) => item.id === request.id );
		if ( index !== -1 ) {
			this.requests.splice( index, 1 );
		}

		this.setCount( this.requests.length );
	}
}
