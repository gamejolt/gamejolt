import { Injectable, Inject } from 'ng-metadata/core';
import { App } from '../../../app-service';
import { MetricMap, Metric, SiteAnalytics, ResourceName, ReportComponent, ReportTopSources, ReportReferringPages, ReportCountries, ReportOs, ReportCommentLanguages, ReportRatingBreakdown, ReportDevRevenue } from '../../../components/site-analytics/site-analytics-service';
import { SiteAnalyticsReport } from '../../../components/site-analytics/report-service';

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

	games: any[];
	game?: any;
	package?: any;
	release?: any;

	pageReports: SiteAnalyticsReport[] = [];

	period: 'all' | 'monthly';
	resource: ResourceName;
	resourceId: number;
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
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( 'Api' ) private Api: any,
		@Inject( 'Game' ) private Game: any,
		@Inject( 'Game_Package' ) private Game_Package: any,
		@Inject( 'Game_Release' ) private Game_Release: any,
		@Inject( 'SiteAnalytics' ) private analytics: SiteAnalytics,
		@Inject( 'SiteAnalyticsReport' ) private reportModel: typeof SiteAnalyticsReport,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'payload' ) payload: any,
	)
	{
		app.title = gettextCatalog.getString( 'Analytics' );
		this.games = Game.populate( payload.games );
		this._init();
	}

	_init()
	{
		// When resource changes.
		this.$scope.$watchGroup( [ 'analyticsCtrl.resource', 'analyticsCtrl.resourceId' ], () =>
		{
			this.Api.sendRequest( '/web/dash/analytics/get-resource/' + this.resource + '/' + this.resourceId )
				.then( ( payload: any ) =>
				{
					this.game = payload.game ? new this.Game( payload.game ) : null;
					this.package = payload.package ? new this.Game_Package( payload.package ) : null;
					this.release = payload.release ? new this.Game_Release( payload.release ) : null;
				} );
		} );

		// Only the fields that can affect histograms.
		const globalWatch = [
			'analyticsCtrl.period',
			'analyticsCtrl.resource',
			'analyticsCtrl.resourceId',
			'analyticsCtrl.startTime',
			'analyticsCtrl.endTime',
		];

		this.$scope.$watchGroup( globalWatch, () =>
		{
			if ( this.resource && this.resourceId ) {
				if ( this.period == 'all' ) {
					this.counts();
				}
				else if ( this.period == 'monthly' ) {
					this.histograms();
				}
			}
		} );

		// Only the fields that can affect report breakdowns.
		this.$scope.$watchGroup( globalWatch.concat( [
			'analyticsCtrl.metric.key',
		] ),
		() =>
		{
			if ( this.period && this.resource && this.resourceId && this.metric ) {
				this.metricChanged();
			}
		} );
	}

	stateChanged( $stateParams: ng.ui.IStateParamsService )
	{
		this.period = $stateParams['period'] || 'monthly';
		this.resource = $stateParams['resource'] || 'Game';
		this.resourceId = parseInt( $stateParams['resourceId'], 10 ) || this.games[0].id;

		if ( this.resource == 'Game' ) {
			this.availableMetrics = this.analytics.gameMetrics;
			this.metric = this.availableMetrics[ $stateParams['metricKey'] || 'view' ];
		}
		else if ( this.resource == 'Game_Package' ) {
			this.availableMetrics = this.analytics.packageMetrics;
			this.metric = this.availableMetrics[ $stateParams['metricKey'] || 'download' ];
		}
		else if ( this.resource == 'Game_Release' ) {
			this.availableMetrics = this.analytics.releaseMetrics;
			this.metric = this.availableMetrics[ $stateParams['metricKey'] || 'download' ];
		}
		else {
			throw new Error( 'Invalid resource.' );
		}

		// If any of the parameters changed, refresh the state.
		if (
			this.period != $stateParams['period']
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

		return this.analytics.getHistogram( this.resource, this.resourceId, this.availableMetrics, [ this.startTime, this.endTime ] )
			.then( ( data: any ) => angular.extend( this, data ) );
	}

	counts()
	{
		return this.analytics.getCount( this.resource, this.resourceId, this.availableMetrics )
			.then( ( data: any ) => angular.extend( this, data ) );
	}

	pullReport( title: string, ...components: ReportComponent[] )
	{
		const report = new this.reportModel( title, components, {
			resource: this.resource,
			resourceId: this.resourceId,
			metric: this.metric,
			startTime: this.startTime,
			endTime: this.endTime,
		} );

		this.pageReports.push( report );
	}

	private metricChanged()
	{
		this.pageReports = [];

		switch ( this.metric.key ) {
			case 'view': {
				this.pullReport( this.gettextCatalog.getString( 'Top Sources' ), ...ReportTopSources );
				this.pullReport( this.gettextCatalog.getString( 'Referring Pages' ), ...ReportReferringPages );
				this.pullReport( this.gettextCatalog.getString( 'Countries' ), ...ReportCountries );
				break;
			}

			case 'download': {
				this.pullReport( this.gettextCatalog.getString( 'Operating Systems' ), ...ReportOs );
				this.pullReport( this.gettextCatalog.getString( 'Top Sources' ), ...ReportTopSources );
				this.pullReport( this.gettextCatalog.getString( 'Referring Pages' ), ...ReportReferringPages );
				this.pullReport( this.gettextCatalog.getString( 'Countries' ), ...ReportCountries );
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
				break;
			}

			case 'revenue': {
				this.pullReport( this.gettextCatalog.getString( 'Revenue Stats' ), ...ReportDevRevenue );
				break;
			}
		}
	}
}
