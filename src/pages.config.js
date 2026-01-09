import Home from './pages/Home';
import RecipeGenerator from './pages/RecipeGenerator';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "RecipeGenerator": RecipeGenerator,
}

export const pagesConfig = {
    mainPage: "RecipeGenerator",
    Pages: PAGES,
    Layout: __Layout,
};