import Layout from "./Layout.jsx";

import Home from "./Home";

import Profile from "./Profile";

import Search from "./Search";

import AddDress from "./AddDress";

import EditProfile from "./EditProfile";

import ProfileSetup from "./ProfileSetup";

import EditDress from "./EditDress";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Profile: Profile,
    
    Search: Search,
    
    AddDress: AddDress,
    
    EditProfile: EditProfile,
    
    ProfileSetup: ProfileSetup,
    
    EditDress: EditDress,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Search" element={<Search />} />
                
                <Route path="/AddDress" element={<AddDress />} />
                
                <Route path="/EditProfile" element={<EditProfile />} />
                
                <Route path="/ProfileSetup" element={<ProfileSetup />} />
                
                <Route path="/EditDress" element={<EditDress />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}