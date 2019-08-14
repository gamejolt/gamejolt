import { AppImgResponsive } from '../../../../../_common/img/responsive/responsive';
import AppJolticon from '../../../../../_common/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { GameCollection } from '../collection.model';

@Component({
	components: {
		AppJolticon,
		AppImgResponsive,
	},
})
export default class AppGameCollectionThumbnail extends Vue {
	@Prop(GameCollection) collection!: GameCollection;
	@Prop(Boolean) hideTag?: boolean;
}
