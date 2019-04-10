import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
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
