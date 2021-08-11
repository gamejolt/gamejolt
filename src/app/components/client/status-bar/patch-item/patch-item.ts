import { Options, Prop, Vue } from 'vue-property-decorator';
import AppProgressBar from '../../../../../_common/progress/bar/bar.vue';
import { ClientLibraryState, ClientLibraryStore } from '../../../../store/client-library';

@Options({
	components: {
		AppProgressBar,
	},
})
export default class AppClientStatusBarPatchItem extends Vue {
	@Prop(Number) packageId!: number;

	@ClientLibraryState packages!: ClientLibraryStore['packages'];
	@ClientLibraryState numPatching!: ClientLibraryStore['numPatching'];

	get pkg() {
		return this.packages.find(i => i.id === this.packageId);
	}

	get width() {
		return (1 / this.numPatching) * 100.0 + '%';
	}
}
