import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./test-other.html';

@View
@Component({
	name: 'route-test-other',
})
export default class RouteTestOther extends Vue
{
}
