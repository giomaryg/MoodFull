import RecipeGenerator from './pages/RecipeGenerator';
import __Layout from './Layout.jsx';


export const PAGES = {
    "RecipeGenerator": RecipeGenerator,
}

export const pagesConfig = {
    mainPage: "RecipeGenerator",
    Pages: PAGES,
    Layout: __Layout,
};