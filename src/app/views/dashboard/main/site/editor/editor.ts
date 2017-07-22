import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Site } from '../../../../../../lib/gj-lib-client/components/site/site-model';
import { SiteEditorModal } from '../../../../../components/site-editor-modal/site-editor-modal.service';
import { BaseRouteComponent } from '../../../../../../lib/gj-lib-client/components/route/route-component';
import AppSiteEditorModal from '../../../../../components/site-editor-modal/site-editor-modal';

@Component({
	beforeRouteLeave(this: RouteDashGamesManageSiteEditorComponent, _to, _from, next) {
		if (this.editorModal && !this.editorModal.canLeave()) {
			return next(false);
		}
		next();
	},
})
export default class RouteDashGamesManageSiteEditorComponent extends BaseRouteComponent {
	@Prop(Site) site: Site;

	editorModal?: AppSiteEditorModal;

	render(h: Vue.CreateElement) {
		return h('div');
	}

	routeInit() {
		this.createModal();
	}

	private async createModal() {
		if (!this.editorModal) {
			this.editorModal = await SiteEditorModal.show(this.site.id);
		}
	}

	routeDestroy() {
		if (this.editorModal) {
			this.editorModal.modal.dismiss();
		}
	}
}
