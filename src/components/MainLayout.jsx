import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({children}) {
    return(
        <>
        <Navbar />
        {children}
        <Footer />
        </>
    );
}