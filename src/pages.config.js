import RecipeGenerator from './pages/RecipeGenerator';
import SavedRecipesPage from './pages/SavedRecipesPage';
import Account from './pages/Account';
import __Layout from './Layout.jsx';


export const PAGES = {
    "RecipeGenerator": RecipeGenerator,
    "SavedRecipesPage": SavedRecipesPage,
    "Account": Account,
}

export const pagesConfig = {
    mainPage: "RecipeGenerator",
    Pages: PAGES,
    Layout: __Layout,
};