import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store';
import AppShellCbarItem from './item/item.vue'

@Component({
	components: {
		AppShellCbarItem,
	},
})
export default class AppShellCbar extends Vue {
	@State
	communities!: Store['communities'];

	Screen = Screen;
}
