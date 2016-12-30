import PostsList from './posts/list/list';
import PostsEdit from './posts/edit/edit';

export default angular.module( 'App.Views.Dashboard.Main.Fireside', [
	PostsList,
	PostsEdit,
] )
.name;
