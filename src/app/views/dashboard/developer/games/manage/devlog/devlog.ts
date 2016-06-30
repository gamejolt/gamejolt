import List from './list/list';
import Edit from './edit/edit';
// import Add from './add/add';

export default angular.module( 'App.Views.Discover.Home', [
	List,
	// Add,
	Edit,
] )
.name;
