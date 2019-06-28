import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { ContentDocument } from 'game-jolt-frontend-lib/components/content/content-document';
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
import { Component } from 'vue-property-decorator';

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
	isHydrated = false;
	isLoading = false;
	errors = [] as string[];

	contentJson!: string;
	contentContext!: string;
	lastEdit!: number;
	resourceTitle!: string;
	resourceUrl!: string;
	ownerName!: string;
	ownerUrl!: string;
	logReason = '';

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

	get routeTitle() {
		if (this.isHydrated) {
			return 'Edit ' + this.title;
		}
		return null;
	}

	get hasErrors() {
		return this.errors.length > 0;
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

	onUpdate(source: string) {
		this.contentJson = source;
	}

	async submit() {
		this.isLoading = true;
		const doc = ContentDocument.fromJson(this.contentJson);
		if (doc instanceof ContentDocument) {
			const contentJson = doc.toJson();
			try {
				const payload = await Api.sendRequest(
					`/z/content/save/${this.$route.params.resource}/${
						this.$route.params.resourceId
					}`,
					{ content: contentJson, log_reason: this.logReason },
					{ noErrorRedirect: true }
				);

				const redirectUrl = payload.redirectUrl;
				Navigate.gotoExternal(redirectUrl);
			} catch (e) {
				this.errors.push('Failed to save changes.');
				console.error('Error while trying to process request', e);
			} finally {
				this.isLoading = false;
			}
		}
	}
}
