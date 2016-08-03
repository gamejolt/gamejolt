import Add from './add/add';
import Manage from './manage/manage';

export default angular.module( 'App.Views.Dashboard.Developer', [
	Add,
	Manage,
] )
.name;
