import { Injectable, Inject } from 'ng-metadata/core';
import { ListCtrl } from './list-controller';
import { App } from '../../../../../checkout/app-service';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';

const BadgeImageMap: any = {
	'featured': '/app/img/categories/featured.png',
	'best': '/app/img/categories/best.png',
	'fresh': '/app/img/categories/best.png',  // TODO: Needs different image.
	'hot': '/app/img/categories/best.png',  // TODO: Needs different image.
	'new': '/app/img/categories/new.png',
	'arcade': '/app/img/categories/arcade.png',
	'action': '/app/img/categories/action.png',
	'adventure': '/app/img/categories/adventure.png',
	'rpg': '/app/img/categories/rpg.png',
	'strategy-sim': '/app/img/categories/strategy-sim.png',
	'platformer': '/app/img/categories/platformer.png',
	'shooter': '/app/img/categories/shooter.png',
	'puzzle': '/app/img/categories/puzzle.png',
	'sports': '/app/img/categories/sports.png',

	'other-1': '/app/img/categories/other-1.png',
	'other-2': '/app/img/categories/other-2.png',
	'other-3': '/app/img/categories/other-3.png',
	'other-4': '/app/img/categories/other-4.png',
	'other-5': '/app/img/categories/other-5.png',
};

@Injectable()
export class FetchCtrl
{
	listCtrl: ListCtrl;

	constructor(
		@Inject( 'App' ) private app: App,
		@Inject( 'Meta' ) private meta: Meta,
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( '$stateParams' ) private $stateParams: ng.ui.IStateParamsService,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'dateFilter' ) private dateFilter: ng.IFilterDate,
		@Inject( 'payload' ) private payload: any,
	)
	{
		this.listCtrl = $scope['$ctrl'];

		this.listCtrl.listing.processPayload( payload );

		this.listCtrl.section = $stateParams['section'];
		this.listCtrl.category = $stateParams['category'] || undefined;

		if ( this.listCtrl.section == 'by-date' ) {
			this.processDateSection();
		}
		else if ( this.listCtrl.section == 'worst' ) {
			this.processWorstSection();
		}
		else {
			this.processGeneralSection();
		}

		this.listCtrl.badgeImage = undefined;
		if ( this.listCtrl.category ) {
			this.listCtrl.badgeImage = BadgeImageMap[ this.listCtrl.category ];
		}
		else if ( this.listCtrl.section != 'by-date' ) {
			this.listCtrl.badgeImage = BadgeImageMap[ this.listCtrl.section ];
		}

		this.app.title = this.listCtrl.pageTitle;
	}

	processDateSection()
	{
		if ( !this.$stateParams['date'] ) {
			this.$state.go( 'error-404' );
			return;
		}

		this.listCtrl.dateRange = undefined;
		this.listCtrl.date = undefined;

		// Range?
		if ( this.$stateParams['date'].search( ':' ) !== -1 ) {
			const dateRange = this.$stateParams['date'].split( ':' );

			// Require only 2 dates.
			if ( dateRange.length > 2 ) {
				this.$state.go( 'error-404' );
				return;
			}

			this.listCtrl.dateRange = [
				this.dateFilter( (new Date( dateRange[0] )), 'mediumDate' ),
				this.dateFilter( (new Date( dateRange[1] )), 'mediumDate' ),
			];
		}
		else {
			this.listCtrl.date = this.dateFilter( (new Date( this.$stateParams['date'] )), 'mediumDate' );
		}

		if ( !this.listCtrl.dateRange ) {
			/// Single date view of games
			/// {{ date }} is available as the localized date
			this.listCtrl.pageTitle = this.gettextCatalog.getString( 'games.list.date_page_title', { date: this.listCtrl.date } );
		}
		else {
			/// When viewing a date range view of games (games published between two dates)
			/// {{ dateStart }} and {{ dateEnd }} are available as localized dates
			this.listCtrl.pageTitle = this.gettextCatalog.getString( 'games.list.date_range_page_title', {
				dateStart: this.listCtrl.dateRange[0],
				dateEnd: this.listCtrl.dateRange[1],
			} );
		}
	}

	processGeneralSection()
	{
		const sectionTranslationKey = 'games.list.section_' + this.listCtrl.section;
		const sectionHuman = this.gettextCatalog.getString( sectionTranslationKey );
		let categoryHuman = ' ';
		if ( this.listCtrl.category ) {
			const categoryTranslationKey = 'discover.categories.' + this.listCtrl.category.replace( '-', '_' );
			categoryHuman = this.gettextCatalog.getString( categoryTranslationKey );
			categoryHuman = (' ' + categoryHuman + ' ');
		}

		let translationId = 'games.list.page_title';
		if ( this.listCtrl.category == 'rpg' ) {
			translationId += '_rpg';
		}
		else if ( this.listCtrl.category == 'other' ) {
			translationId += '_other';
		}

		this.listCtrl.pageTitle = this.gettextCatalog.getString( translationId, { section: sectionHuman, category: categoryHuman } );
		this.meta.description = this.payload.metaDescription;

		if ( this.listCtrl.category == 'rpg' ) {
			/// {{ category }} is available as the translated category label
			this.listCtrl.descriptiveCategory = this.gettextCatalog.getString( 'games.list.descriptive_category_rpg', { category: categoryHuman } );
		}
		else if ( this.listCtrl.category == 'other' ) {
			/// {{ category }} is available as the translated category label
			this.listCtrl.descriptiveCategory = this.gettextCatalog.getString( 'games.list.descriptive_category_other', { category: categoryHuman } );
		}
		else {
			/// {{ category }} is available as the translated category label
			/// In the case of no category, {{ category }} will be empty ''
			this.listCtrl.descriptiveCategory = this.gettextCatalog.getString( 'games.list.descriptive_category', { category: categoryHuman } );
		}
	}

	processWorstSection()
	{
		this.listCtrl.pageTitle = 'Ṣ̢̖͇͈͙̹̦Y̱͍͉S̺̳̞͠Y̸̱͚̙͕̺̺ͅS͎̘̲͕̹̀ͅT͉͕̺̲ͅE͓̱̥̠̰̱͚M̪̙̪̥̹ͅ ͏̼̲̫̰E͇̺̩̼R͏̗͙Ŕ͖̦͕Ơ̰̱͖̗̯̞R҉̻̯̠͚';
	}
}
