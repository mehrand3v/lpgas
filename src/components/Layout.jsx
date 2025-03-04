import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div className="flex">
      <Navbar />
      <main className="flex-grow p-4 ml-64">{children}</main>
    </div>
  );
}

export default Layout;
