import { Injectable, Inject } from 'ng-metadata/core';

@Injectable('SiteEditorModal')
export class SiteEditorModal {
	constructor(
		@Inject('$rootScope') private $rootScope: ng.IRootScopeService,
		@Inject('$document') private $document: ng.IDocumentService,
		@Inject('$compile') private $compile: ng.ICompileService,
		@Inject('$animate') private $animate: ng.animate.IAnimateService
	) {}

	show(siteId: number, tab: 'theme' | 'content' = 'theme') {
		const body: HTMLElement = this.$document.find('body').eq(0)[0];

		const modalScope = this.$rootScope.$new(true);
		modalScope['siteId'] = siteId;
		modalScope['tab'] = tab;
		modalScope['close'] = () => {
			this.$animate.leave(modalElem).then(() => {
				modalScope.$destroy();
				body.classList.remove('site-editor-modal-open');
			});
		};

		const modalElemTemplate = angular.element(`
			<gj-site-editor-modal
				[site-id]="siteId"
				[initial-tab]="tab"
				(close)="close()"
				>
			</gj-site-editor-modal>`);
		const modalElem = this.$compile(modalElemTemplate)(modalScope);

		this.$animate.enter(modalElem, angular.element(body));
		body.classList.add('site-editor-modal-open');
	}
}
