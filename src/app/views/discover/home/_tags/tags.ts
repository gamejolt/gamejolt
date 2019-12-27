import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppTagList from '../../../../components/tag/list/list.vue';

@Component({
	components: {
		AppTagList,
	},
})
export default class AppDiscoverHomeTags extends Vue {}
