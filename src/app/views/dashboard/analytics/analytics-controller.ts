import { Injectable, Inject } from 'ng-metadata/core';
import { StateService, StateParams } from 'angular-ui-router';

import { App } from '../../../app-service';
import { MetricMap, Metric, SiteAnalytics, ResourceName,
	ReportComponent, ReportTopSources, ReportReferringPages, ReportCountries,
	ReportOs, ReportCommentLanguages, ReportRatingBreakdown, ReportDevRevenue,
	ReportTopGames, ReportTopGameRevenue, ReportTopGamePartnerRevenue, ReportTopPartners, ReportPartnerRevenue,
	ReportPartnerGeneratedRevenue, ReportTopPartnerRevenue } from '../../../components/site-analytics/site-analytics-service';
import { SiteAnalyticsReport } from '../../../components/site-analytics/report-service';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../../../lib/gj-lib-client/components/game/package/package.model';
import { GameRelease } from '../../../../lib/gj-lib-client/components/game/release/release.model';

@Injectable()
export class AnalyticsCtrl
{
	/**
	 * When the page first loads we check the state params to make sure they are all filled in.
	 * If they weren't, we change the URL. When this happens it'll replace the previous URL
	 * unless we skip the replacement. After our initial params are bootstrapped it's fine to
	 * replace the URL from there on out.
	 */
	private paramsBootstrapped = false;
	private appUserId: number;

	user?: any;
	game?: any;
	package?: any;
	release?: any;

	pageReports: SiteAnalyticsReport[] = [];

	period: 'all' | 'monthly';
	resource: ResourceName;
	resourceId: number;
	partnerMode: boolean;
	viewAs: number;
	availableMetrics: MetricMap;
	metric: Metric;

	now: number;
	startTime?: number;
	endTime?: number;
	prevMonth?: number;
	prevYear?: number;
	nextMonth?: number;
	nextYear?: number;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( '$state' ) private $state: StateService,
		@Inject( '$stateParams' ) $stateParams: StateParams,
		@Inject( 'SiteAnalytics' ) private analytics: SiteAnalytics,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any,
	)
	{
		app.title = gettextCatalog.getString( 'Analytics' );
		this.resource = $stateParams['resource'];
		this.resourceId = parseInt( $stateParams['resourceId'], 10 );

		this.user = payload.user ? new User( payload.user ) : null;
		this.game = payload.game ? new Game( payload.game ) : null;
		this.package = payload.package ? new GamePackage( payload.package ) : null;
		this.release = payload.release ? new GameRelease( payload.release ) : null;

		this.appUserId = app.user!.id;
		this.viewAs = this.appUserId;
		this.partnerMode = !this.user || this.user.id != this.viewAs;

		if ( this.partnerMode ) {
			this.availableMetrics = this.analytics.pickPartnerMetrics( this.availableMetrics );
		}

		this._init();
	}

	_init()
	{
		// Only the fields that can affect histograms.
		const globalWatch = [
			'analyticsCtrl.period',
			'analyticsCtrl.startTime',
			'analyticsCtrl.endTime',
		];

		this.$scope.$watchGroup( globalWatch, () =>
		{
			if ( this.period == 'all' ) {
				this.counts();
			}
			else if ( this.period == 'monthly' ) {
				this.histograms();
			}
		} );

		// Only the fields that can affect report breakdowns.
		this.$scope.$watchGroup( globalWatch.concat( [
			'analyticsCtrl.metric.key',
		] ),
		() =>
		{
			if ( this.period && this.metric ) {
				this.metricChanged();
			}
		} );
	}

	stateChanged( $stateParams: StateParams )
	{
		if ( $stateParams['viewAs'] ) {
			this.viewAs = parseInt( $stateParams['viewAs'], 10 ) || this.appUserId;
		}
		else {
			this.viewAs = this.appUserId;
		}
		this.partnerMode = !this.user || this.user.id != this.viewAs;
		this.period = $stateParams['period'] || 'monthly';
		this.resource = $stateParams['resource'];
		this.resourceId = parseInt( $stateParams['resourceId'], 10 );

		switch ( this.resource ) {
			case 'User':
				this.availableMetrics = this.analytics.userMetrics;
				this.metric = this.availableMetrics[ $stateParams['metricKey'] || 'user-view' ]
				break;

			case 'Game':
				this.availableMetrics = this.analytics.gameMetrics;
				this.metric = this.availableMetrics[ $stateParams['metricKey'] || 'view' ];
				break;

			case 'Game_Package':
				if ( this.partnerMode ) {
					throw new Error( 'Invalid resource.' );
				}
				this.availableMetrics = this.analytics.packageMetrics;
				this.metric = this.availableMetrics[ $stateParams['metricKey'] || 'download' ];
				break;

			case 'Game_Release':
				if ( this.partnerMode ) {
					throw new Error( 'Invalid resource.' );
				}
				this.availableMetrics = this.analytics.releaseMetrics;
				this.metric = this.availableMetrics[ $stateParams['metricKey'] || 'download' ];
				break;

			default:
				throw new Error( 'Invalid resource.' );
		}

		if ( this.partnerMode ) {
			this.availableMetrics = this.analytics.pickPartnerMetrics( this.availableMetrics );
		}

		// If any of the parameters changed, refresh the state.
		if (
			(!$stateParams['viewAs'] && this.viewAs != this.appUserId)
			|| ($stateParams['viewAs'] && this.viewAs != $stateParams['viewAs'])
			|| this.period != $stateParams['period']
			|| this.metric.key != $stateParams['metricKey']
			|| this.resource != $stateParams['resource']
			|| this.resourceId != $stateParams['resourceId']
		) {
			let options = {};
			if ( this.paramsBootstrapped ) {
				options = { location: 'replace' };
			}

			let stateParams: any = _.pick( this, [ 'period', 'resource', 'resourceId' ] );
			stateParams.metricKey = this.metric.key;
			if ( this.viewAs != this.appUserId ) {
				stateParams.viewAs = this.viewAs;
			}

			this.$state.go(
				'dashboard.analytics.view',
				stateParams,
				options,
			);

			this.paramsBootstrapped = true;
			return;
		}

		this.paramsBootstrapped = true;

		this.now = Date.now();
		this.startTime = undefined;
		this.endTime = undefined;

		this.prevMonth = undefined;
		this.prevYear = undefined;

		this.nextMonth = undefined;
		this.nextYear = undefined;
		if ( this.period == 'monthly' ) {

			const date = new Date();
			let year: number, month: number;
			if ( !$stateParams['year'] || !$stateParams['month'] ) {
				year = date.getFullYear();
				month = date.getMonth();
			}
			else {
				year = parseInt( $stateParams['year'], 10 );
				month = parseInt( $stateParams['month'], 10 );
			}

			this.startTime = (new Date( year, month, 1 )).getTime();
			this.endTime = (new Date( year, month + 1, 1 )).getTime() - 1;

			this.prevMonth = (new Date( year, month - 1, 1 )).getMonth();
			this.prevYear = (new Date( year, month - 1, 1 )).getFullYear();

			this.nextMonth = (new Date( year, month + 1, 1 )).getMonth();
			this.nextYear = (new Date( year, month + 1, 1 )).getFullYear();
		}
	}

	histograms()
	{
		if ( !this.startTime || !this.endTime ) {
			throw new Error( 'Dates required to get histograms.' );
		}

		return this.analytics.getHistogram( this.resource, this.resourceId, this.availableMetrics, this.partnerMode, this.viewAs, [ this.startTime, this.endTime ] )
			.then( ( data: any ) => angular.extend( this, data ) );
	}

	counts()
	{
		return this.analytics.getCount( this.resource, this.resourceId, this.availableMetrics, this.partnerMode, this.viewAs )
			.then( ( data: any ) => angular.extend( this, data ) );
	}

	pullReport( title: string, ...components: ReportComponent[] )
	{
		const report = new SiteAnalyticsReport( title, components, this.resource, this.resourceId, this.metric.collection, this.partnerMode, this.viewAs, this.startTime, this.endTime );

		this.pageReports.push( report );
	}

	private metricChanged()
	{
		this.pageReports = [];

		if ( this.resource != 'User' ) {
			switch ( this.metric.key ) {
				case 'view': {
					this.pullReport( this.gettextCatalog.getString( 'Top Sources' ), ...ReportTopSources );
					this.pullReport( this.gettextCatalog.getString( 'Referring Pages' ), ...ReportReferringPages );
					this.pullReport( this.gettextCatalog.getString( 'Countries' ), ...ReportCountries );
					if ( !this.partnerMode ) {
						this.pullReport( this.gettextCatalog.getString( 'Partners' ), ...ReportTopPartners );
					}
					break;
				}

				case 'download': {
					this.pullReport( this.gettextCatalog.getString( 'Operating Systems' ), ...ReportOs );
					this.pullReport( this.gettextCatalog.getString( 'Top Sources' ), ...ReportTopSources );
					this.pullReport( this.gettextCatalog.getString( 'Referring Pages' ), ...ReportReferringPages );
					this.pullReport( this.gettextCatalog.getString( 'Countries' ), ...ReportCountries );
					if ( !this.partnerMode ) {
						this.pullReport( this.gettextCatalog.getString( 'Partners' ), ...ReportTopPartners );
					}
					break;
				}

				case 'install': {
					this.pullReport( this.gettextCatalog.getString( 'Operating Systems' ), ...ReportOs );
					this.pullReport( this.gettextCatalog.getString( 'Countries' ), ...ReportCountries );
					break;
				}

				case 'comment': {
					this.pullReport( this.gettextCatalog.getString( 'Languages' ), ...ReportCommentLanguages );
					break;
				}

				case 'rating': {
					this.pullReport( this.gettextCatalog.getString( 'Rating Breakdown' ), ...ReportRatingBreakdown );
					break;
				}

				case 'follow': {
					this.pullReport( this.gettextCatalog.getString( 'Countries' ), ...ReportCountries );
					break;
				}

				case 'sale': {
					this.pullReport( this.gettextCatalog.getString( 'Top Sources' ), ...ReportTopSources );
					this.pullReport( this.gettextCatalog.getString( 'Referring Pages' ), ...ReportReferringPages );
					this.pullReport( this.gettextCatalog.getString( 'Countries' ), ...ReportCountries );
					this.pullReport( this.gettextCatalog.getString( 'Operating Systems' ), ...ReportOs );
					if ( !this.partnerMode ) {
						this.pullReport( this.gettextCatalog.getString( 'Partners' ), ...ReportTopPartners );
					}
					break;
				}

				case 'revenue': {
					if ( !this.partnerMode ) {
						this.pullReport( this.gettextCatalog.getString( 'Revenue Stats' ), ...ReportDevRevenue );
						this.pullReport( this.gettextCatalog.getString( 'Revenue from Partners' ), ...ReportPartnerGeneratedRevenue );
						this.pullReport( this.gettextCatalog.getString( 'Top Profitable Partners' ), ...ReportTopPartnerRevenue );
					}
					else {
						this.pullReport( this.gettextCatalog.getString( 'Revenue Stats' ), ...ReportPartnerRevenue );
					}
					break;
				}
			}
		}
		else {
			switch ( this.metric.key ) {
				case 'view': {
					this.pullReport( this.gettextCatalog.getString( 'Top Games' ), ...ReportTopGames );
					this.pullReport( this.gettextCatalog.getString( 'Top Sources' ), ...ReportTopSources );
					this.pullReport( this.gettextCatalog.getString( 'Countries' ), ...ReportCountries );
					if ( !this.partnerMode ) {
						this.pullReport( this.gettextCatalog.getString( 'Partners' ), ...ReportTopPartners );
					}
					break;
				}

				case 'download': {
					this.pullReport( this.gettextCatalog.getString( 'Top Games' ), ...ReportTopGames );
					this.pullReport( this.gettextCatalog.getString( 'Operating Systems' ), ...ReportOs );
					this.pullReport( this.gettextCatalog.getString( 'Top Sources' ), ...ReportTopSources );
					this.pullReport( this.gettextCatalog.getString( 'Countries' ), ...ReportCountries );
					if ( !this.partnerMode ) {
						this.pullReport( this.gettextCatalog.getString( 'Partners' ), ...ReportTopPartners );
					}
					break;
				}

				case 'install': {
					this.pullReport( this.gettextCatalog.getString( 'Top Games' ), ...ReportTopGames );
					this.pullReport( this.gettextCatalog.getString( 'Operating Systems' ), ...ReportOs );
					this.pullReport( this.gettextCatalog.getString( 'Countries' ), ...ReportCountries );
					break;
				}

				case 'comment': {
					this.pullReport( this.gettextCatalog.getString( 'Top Games' ), ...ReportTopGames );
					this.pullReport( this.gettextCatalog.getString( 'Languages' ), ...ReportCommentLanguages );
					break;
				}

				case 'rating': {
					this.pullReport( this.gettextCatalog.getString( 'Top Games' ), ...ReportTopGames );
					this.pullReport( this.gettextCatalog.getString( 'Rating Breakdown' ), ...ReportRatingBreakdown );
					break;
				}

				case 'follow': {
					this.pullReport( this.gettextCatalog.getString( 'Top Games' ), ...ReportTopGames );
					this.pullReport( this.gettextCatalog.getString( 'Countries' ), ...ReportCountries );
					break;
				}

				case 'sale': {
					this.pullReport( this.gettextCatalog.getString( 'Top Games' ), ...ReportTopGames );
					this.pullReport( this.gettextCatalog.getString( 'Top Sources' ), ...ReportTopSources );
					this.pullReport( this.gettextCatalog.getString( 'Countries' ), ...ReportCountries );
					this.pullReport( this.gettextCatalog.getString( 'Operating Systems' ), ...ReportOs );
					if ( !this.partnerMode ) {
						this.pullReport( this.gettextCatalog.getString( 'Partners' ), ...ReportTopPartners );
					}
					break;
				}

				case 'revenue': {
					if ( !this.partnerMode ) {
						this.pullReport( this.gettextCatalog.getString( 'Revenue Stats' ), ...ReportDevRevenue );
						this.pullReport( this.gettextCatalog.getString( 'Top Profitable Games' ), ...ReportTopGameRevenue );
						this.pullReport( this.gettextCatalog.getString( 'Revenue from Partners' ), ...ReportPartnerGeneratedRevenue );
						this.pullReport( this.gettextCatalog.getString( 'Top Profitable Partners' ), ...ReportTopPartnerRevenue );
					}
					else  {
						this.pullReport( this.gettextCatalog.getString( 'Revenue Stats' ), ...ReportPartnerRevenue );
						this.pullReport( this.gettextCatalog.getString( 'Top Profitable Games' ), ...ReportTopGamePartnerRevenue );
					}
					break;
				}
			}
		}
	}
}
