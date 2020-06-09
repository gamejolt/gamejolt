import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppScrollScroller from '../../../../../../_common/scroll/scroller/scroller.vue';
import AppNavChannelCards from './cards.vue';

@Component({
	components: {
		AppScrollScroller,
		AppNavChannelCards,
	},
})
export default class AppNavChannelsInline extends Vue {}
