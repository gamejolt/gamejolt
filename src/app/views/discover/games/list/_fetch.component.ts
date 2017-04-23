// import { Component, OnInit, Input, Inject } from 'ng-metadata/core';
// import { StateService, StateParams } from 'angular-ui-router';
// import * as template from '!html-loader!./_fetch.component.html';

// import { App } from '../../../../app-service';
// import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
// import { RouteListComponent } from './list.component';
// import { GameListingContainer } from '../../../../components/game/listing/listing-container-service';

// const BadgeImageMap: any = {
// 	'featured': require( '../../../../img/categories/featured.png' ),
// 	'best': require( '../../../../img/categories/best.png' ),
// 	'fresh': require( '../../../../img/categories/best.png' ),
// 	'hot': require( '../../../../img/categories/best.png' ),
// 	'new': require( '../../../../img/categories/new.png' ),
// 	'arcade': require( '../../../../img/categories/arcade.png' ),
// 	'action': require( '../../../../img/categories/action.png' ),
// 	'adventure': require( '../../../../img/categories/adventure.png' ),
// 	'rpg': require( '../../../../img/categories/rpg.png' ),
// 	'strategy-sim': require( '../../../../img/categories/strategy-sim.png' ),
// 	'platformer': require( '../../../../img/categories/platformer.png' ),
// 	'shooter': require( '../../../../img/categories/shooter.png' ),
// 	'puzzle': require( '../../../../img/categories/puzzle.png' ),
// 	'sports': require( '../../../../img/categories/sports.png' ),

// 	'other-1': require( '../../../../img/categories/other-1.png' ),
// 	'other-2': require( '../../../../img/categories/other-2.png' ),
// 	'other-3': require( '../../../../img/categories/other-3.png' ),
// 	'other-4': require( '../../../../img/categories/other-4.png' ),
// 	'other-5': require( '../../../../img/categories/other-5.png' ),
// };

// @Component({
// 	selector: 'route-discover-games-list-fetch',
// 	template,
// })
// export class RouteFetchComponent implements OnInit
// {
// 	@Input( 'payload' ) payload: any;

// 	@Input() listing: GameListingContainer;

// 	$parent: RouteListComponent;

// 	constructor(
// 		@Inject( '$scope' ) $scope: ng.IScope,
// 		@Inject( 'App' ) private app: App,
// 		@Inject( '$state' ) private $state: StateService,
// 		@Inject( '$stateParams' ) private $stateParams: StateParams,
// 		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
// 		@Inject( 'dateFilter' ) private dateFilter: ng.IFilterDate,
// 	)
// 	{
// 		this.$parent = $scope.$parent['$ctrl'];
// 	}

// 	ngOnInit()
// 	{
// 		this.listing.processPayload( this.payload );

// 		this.$parent.section = this.$stateParams['section'];
// 		this.$parent.category = this.$stateParams['category'] || undefined;

// 		if ( this.$parent.section == 'by-date' ) {
// 			this.processDateSection();
// 		}
// 		else if ( this.$parent.section == 'worst' ) {
// 			this.processWorstSection();
// 		}
// 		else {
// 			this.processGeneralSection();
// 		}

// 		this.$parent.badgeImage = undefined;
// 		if ( this.$parent.category ) {
// 			this.$parent.badgeImage = BadgeImageMap[ this.$parent.category ];
// 		}
// 		else if ( this.$parent.section != 'by-date' ) {
// 			this.$parent.badgeImage = BadgeImageMap[ this.$parent.section ];
// 		}

// 		this.app.title = this.$parent.pageTitle;
// 	}

// 	processDateSection()
// 	{
// 		if ( !this.$stateParams['date'] ) {
// 			this.$state.go( 'error-404' );
// 			return;
// 		}

// 		this.$parent.dateRange = undefined;
// 		this.$parent.date = undefined;

// 		// Range?
// 		if ( this.$stateParams['date'].search( ':' ) !== -1 ) {
// 			const dateRange = this.$stateParams['date'].split( ':' );

// 			// Require only 2 dates.
// 			if ( dateRange.length > 2 ) {
// 				this.$state.go( 'error-404' );
// 				return;
// 			}

// 			this.$parent.dateRange = [
// 				this.dateFilter( (new Date( dateRange[0] )), 'mediumDate' ),
// 				this.dateFilter( (new Date( dateRange[1] )), 'mediumDate' ),
// 			];
// 		}
// 		else {
// 			this.$parent.date = this.dateFilter( (new Date( this.$stateParams['date'] )), 'mediumDate' );
// 		}

// 		if ( !this.$parent.dateRange ) {
// 			/// Single date view of games
// 			/// {{ date }} is available as the localized date
// 			this.$parent.pageTitle = this.gettextCatalog.getString( 'games.list.date_page_title', { date: this.$parent.date } );
// 		}
// 		else {
// 			/// When viewing a date range view of games (games published between two dates)
// 			/// {{ dateStart }} and {{ dateEnd }} are available as localized dates
// 			this.$parent.pageTitle = this.gettextCatalog.getString( 'games.list.date_range_page_title', {
// 				dateStart: this.$parent.dateRange[0],
// 				dateEnd: this.$parent.dateRange[1],
// 			} );
// 		}
// 	}

// 	processGeneralSection()
// 	{
// 		const sectionTranslationKey = 'games.list.section_' + this.$parent.section;
// 		const sectionHuman = this.gettextCatalog.getString( sectionTranslationKey );
// 		let categoryHuman = ' ';
// 		if ( this.$parent.category ) {
// 			const categoryTranslationKey = 'discover.categories.' + this.$parent.category.replace( '-', '_' );
// 			categoryHuman = this.gettextCatalog.getString( categoryTranslationKey );
// 			categoryHuman = (' ' + categoryHuman + ' ');
// 		}

// 		let translationId = 'games.list.page_title';
// 		if ( this.$parent.category == 'rpg' ) {
// 			translationId += '_rpg';
// 		}
// 		else if ( this.$parent.category == 'other' ) {
// 			translationId += '_other';
// 		}

// 		this.$parent.pageTitle = this.gettextCatalog.getString( translationId, { section: sectionHuman, category: categoryHuman } );
// 		Meta.description = this.payload.metaDescription;

// 		if ( this.$parent.category == 'rpg' ) {
// 			/// {{ category }} is available as the translated category label
// 			this.$parent.descriptiveCategory = this.gettextCatalog.getString( 'games.list.descriptive_category_rpg', { category: categoryHuman } );
// 		}
// 		else if ( this.$parent.category == 'other' ) {
// 			/// {{ category }} is available as the translated category label
// 			this.$parent.descriptiveCategory = this.gettextCatalog.getString( 'games.list.descriptive_category_other', { category: categoryHuman } );
// 		}
// 		else {
// 			/// {{ category }} is available as the translated category label
// 			/// In the case of no category, {{ category }} will be empty ''
// 			this.$parent.descriptiveCategory = this.gettextCatalog.getString( 'games.list.descriptive_category', { category: categoryHuman } );
// 		}
// 	}

// 	processWorstSection()
// 	{
// 		this.$parent.pageTitle = 'Ṣ̢̖͇͈͙̹̦Y̱͍͉S̺̳̞͠Y̸̱͚̙͕̺̺ͅS͎̘̲͕̹̀ͅT͉͕̺̲ͅE͓̱̥̠̰̱͚M̪̙̪̥̹ͅ ͏̼̲̫̰E͇̺̩̼R͏̗͙Ŕ͖̦͕Ơ̰̱͖̗̯̞R҉̻̯̠͚';
// 	}
// }
