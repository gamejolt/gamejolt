import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { ContentDocument } from 'game-jolt-frontend-lib/components/content/content-document';
import AppContentEditorTS from 'game-jolt-frontend-lib/components/content/content-editor/content-editor';
import AppContentEditor from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.vue';
import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import { Navigate } from 'game-jolt-frontend-lib/components/navigate/navigate.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../store/index';

@Component({
	name: 'RouteContent',
	components: {
		AppContentEditor,
		AppLoading,
		AppTimeAgo,
		AppContentViewer,
	},
})
@RouteResolver({
	deps: { params: ['resource', 'resource-Id'] },
	async resolver({ route }) {
		await User.touch();
		const payload = await Api.sendRequest(
			`/z/content/${route.params.resource}/${route.params.resourceId}`
		);
		return payload;
	},
})
export default class RouteContent extends BaseRouteComponent {
	@AppState
	userBootstrapped!: AppStore['userBootstrapped'];

	@State
	app!: Store['app'];

	isHydrated = false;

	contentJson!: string;
	contentContext!: string;
	lastEdit!: number;
	resourceTitle!: string;
	resourceUrl!: string;
	ownerName!: string;
	ownerUrl!: string;
	logReason = '';

	$refs!: {
		editor: AppContentEditorTS;
	};

	camelCase(str: string) {
		return str.replace(/-([a-z])/gi, function(_all, letter) {
			return ' ' + letter.toUpperCase();
		});
	}

	get title() {
		let title = this.camelCase(this.contentContext);
		title = title[0].toUpperCase() + title.substr(1);
		return title;
	}

	get canSubmit() {
		return this.logReason.length > 0;
	}

	get user() {
		return this.app.user!;
	}

	get routeTitle() {
		if (this.isHydrated) {
			return 'Edit ' + this.title;
		}
		return null;
	}

	routeResolved($payload: any) {
		this.contentJson = $payload.content;
		this.contentContext = $payload.context;

		const doc = ContentDocument.fromJson(this.contentJson!);
		this.lastEdit = doc.createdOn;

		this.resourceTitle = $payload.resourceTitle;
		this.resourceUrl = $payload.resourceUrl;
		this.ownerName = $payload.ownerName;
		this.ownerUrl = $payload.ownerUrl;

		this.isHydrated = true;
	}

	onChangeLogReason() {
		const elem = document.getElementById('log-reason') as HTMLTextAreaElement;
		this.logReason = elem.value;
	}

	async submit() {
		const doc = this.$refs.editor.getContent();
		if (doc instanceof ContentDocument) {
			const contentJson = doc.toJson();
			const payload = await Api.sendRequest(
				`/z/content/save/${this.$route.params.resource}/${this.$route.params.resourceId}`,
				{ content: contentJson, log_reason: this.logReason }
			);

			const redirectUrl = payload.redirectUrl;
			Navigate.gotoExternal(redirectUrl);
		}
	}
}
