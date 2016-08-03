import { Component, Inject, Output } from 'ng-metadata/core';
import { App } from './../../../app-service';
import template from 'html!./request-popover.html';

const COUNT_INTERVAL = (5 * 60 * 1000);  // 5 minutes.
const INITIAL_LAG = 3000;

type Tab = 'requests' | 'pending';

@Component({
	selector: 'gj-friend-request-popover',
	template,
})
export class RequestPopoverComponent
{
	@Output( 'onFocus' ) _onFocus: Function;
	@Output( 'onBlur' ) _onBlur: Function;
	@Output( 'onRequestsCount' ) _onRequestsCount: Function;

	private isShown = false;
	private isLoading = true;

	private activeTab: Tab = 'requests';
	private requests: any[] = [];
	private requestsCount = 0;
	private pending: any[] = [];

	constructor(
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$interval' ) $interval: ng.IIntervalService,
		@Inject( '$timeout' ) $timeout: ng.ITimeoutService,
		@Inject( 'App' ) app: App,
		@Inject( 'User_Friendship' ) private userFriendshipModel: any,
		@Inject( 'User_FriendshipsHelper' ) private userFriendshipsHelper: any
	)
	{
		$scope['App'] = app;

		// Fetch count right away.
		$timeout( () =>
		{
			this.fetchCount();
		}, INITIAL_LAG );

		// Fetch counts every X minutes afterwards.
		const countInterval = $interval( () =>
		{
			this.fetchCount();
		}, COUNT_INTERVAL );

		$scope.$on( '$destroy', () =>
		{
			$interval.cancel( countInterval );
		} );
	}

	onFocus()
	{
		this.isShown = true;
		this.fetchRequests();
		if ( this._onFocus ) {
			this._onFocus();
		}
	}

	onBlur()
	{
		this.isShown = false;
		if ( this._onBlur ) {
			this._onBlur();
		}
	}

	private _setCount( count: number )
	{
		this.requestsCount = count;
		if ( this._onRequestsCount ) {
			this._onRequestsCount( { $count: this.requestsCount } );
		}
	}

	fetchCount()
	{
		this.userFriendshipModel.fetchCount()
			.then( ( response: any ) =>
			{
				this._setCount( response.requestCount );
			} );
	}

	fetchRequests()
	{
		this.userFriendshipModel.fetchRequests()
			.then( ( response: any ) =>
			{
				this.requests = response.requests;
				this._setCount( this.requests.length );
				this.pending = response.pending;
				this.isLoading = false;
			} );
	}

	setActiveTab( tab: Tab )
	{
		this.activeTab = tab;
	}

	acceptRequest( request: any )
	{
		this.userFriendshipsHelper.acceptRequest( request )
			.then( () =>
			{
				_.remove( this.requests, { id: request.id } );
				this._setCount( this.requests.length );
			} );
	}

	rejectRequest( request: any )
	{
		this.userFriendshipsHelper.rejectRequest( request )
			.then( () =>
			{
				_.remove( this.requests, { id: request.id } );
				this._setCount( this.requests.length );
			} );
	}

	cancelRequest( request: any )
	{
		this.userFriendshipsHelper.cancelRequest( request )
			.then( () =>
			{
				_.remove( this.pending, { id: request.id } );
			} );
	}
}
