import { Modal } from '../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';

export class SiteEditorModal {
	static async show(siteId: number, tab: 'theme' | 'content' = 'theme') {
		return await Modal.show<void>({
			component: () => asyncComponentLoader(import('./site-editor-modal')),
			props: { siteId, initialTab: tab },
		});
	}
}

// @Injectable('SiteEditorModal')
// export class SiteEditorModal {
// 	constructor(
// 		@Inject('$rootScope') private $rootScope: ng.IRootScopeService,
// 		@Inject('$document') private $document: ng.IDocumentService,
// 		@Inject('$compile') private $compile: ng.ICompileService,
// 		@Inject('$animate') private $animate: ng.animate.IAnimateService
// 	) {}

// 	show(siteId: number, tab: 'theme' | 'content' = 'theme') {
// 		const body: HTMLElement = this.$document.find('body').eq(0)[0];

// 		const modalScope = this.$rootScope.$new(true);
// 		modalScope['siteId'] = siteId;
// 		modalScope['tab'] = tab;
// 		modalScope['close'] = () => {
// 			this.$animate.leave(modalElem).then(() => {
// 				modalScope.$destroy();
// 				body.classList.remove('site-editor-modal-open');
// 			});
// 		};

// 		const modalElemTemplate = angular.element(`
// 			<gj-site-editor-modal
// 				[site-id]="siteId"
// 				[initial-tab]="tab"
// 				(close)="close()"
// 				>
// 			</gj-site-editor-modal>`);
// 		const modalElem = this.$compile(modalElemTemplate)(modalScope);

// 		this.$animate.enter(modalElem, angular.element(body));
// 		body.classList.add('site-editor-modal-open');
// 	}
// }
