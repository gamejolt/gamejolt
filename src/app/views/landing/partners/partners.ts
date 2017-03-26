import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./partners.html';

@View
@Component({
	name: 'route-landing-partners',
})
export default class RouteLandingPartners extends Vue
{
}
