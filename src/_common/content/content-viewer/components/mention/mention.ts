import { Inject, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import AppUserCardHover from '../../../../user/card/hover/hover.vue';
import { User } from '../../../../user/user.model';
import { ContentOwnerController, ContentOwnerControllerKey } from '../../../content-owner';

@Options({
	components: {
		AppUserCardHover,
	},
})
export default class AppContentViewerMention extends Vue {
	@Prop(String)
	username!: string;

	@Inject({ from: ContentOwnerControllerKey })
	owner!: ContentOwnerController;

	user: User | null = null;

	private hydrateUser() {
		// Make sure we never execute a promise if we don't have to, it would break SSR.
		this.owner.hydrator.useData<any>('username', this.username, data => {
			if (data !== null) {
				this.user = new User(data);
			}
		});
	}

	created() {
		this.hydrateUser();
	}

	@Watch('username')
	onUsernameChanged() {
		this.hydrateUser();
	}
}
