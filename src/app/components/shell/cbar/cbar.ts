import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppCommunityAddWidget from '../../../../_common/community/add-widget/add-widget.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { Store } from '../../../store';
import AppShellCbarItem from './item/item.vue';

@Component({
	components: {
		AppShellCbarItem,
		AppCommunityAddWidget,
	},
})
export default class AppShellCbar extends Vue {
	@State
	communities!: Store['communities'];

	Screen = Screen;
}
