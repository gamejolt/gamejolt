import List from './list/list';
import Add from './add/add';

export default angular.module( 'App.Views.Discover.Home', [
	List,
	Add,
] )
.name;
