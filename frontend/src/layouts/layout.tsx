import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
//  TypeScript type Props which specifies the expected props for the Layout component.
// children: A required prop of type React.ReactNode, which represents the child components or elements that will be passed to the Layout component.
// showHero: An optional boolean prop that defaults to false. If set to true, it indicates whether the Hero component should be displayed.
// ? sign in showHero ?:boolean is part of TypeScript syntax and it denotes an optional property in a type definition.
type Props={
  children :React.ReactNode;
  showHero ?:boolean;
}

const Layout=({children,showHero=false }:Props)=>{
    return (
        <div className="flex flex-col min-h-screen">
            <Header/>
            {showHero && <Hero/>}
            <div className="container mx-auto flex-1 py-10">{children}</div>
            <Footer/>
        </div>
    )
}
export default Layout;