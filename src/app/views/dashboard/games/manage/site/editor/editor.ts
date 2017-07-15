import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { SiteEditorModal } from '../../../../../../components/site-editor-modal/site-editor-modal.service';
import { Site } from '../../../../../../../lib/gj-lib-client/components/site/site-model';
import AppSiteEditorModal from '../../../../../../components/site-editor-modal/site-editor-modal';

@Component({
	beforeRouteLeave(this: RouteDashGamesManageSiteEditorComponent, _to, _from, next) {
		if (!this.editorModal.canLeave()) {
			return next(false);
		}
		next();
	},
})
export default class RouteDashGamesManageSiteEditorComponent extends Vue {
	@Prop(Site) site: Site;

	editorModal: AppSiteEditorModal;

	render(h: Vue.CreateElement) {
		return h('div');
	}

	async mounted() {
		this.editorModal = await SiteEditorModal.show(this.site.id);
	}

	destroyed() {
		this.editorModal.modal.dismiss();
	}
}
