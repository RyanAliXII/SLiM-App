import { createRoutesFromChildren, Route } from "react-router-dom";
import ProtectedRoutes from "../components/auth/ProtectedRoutes";
import PublicRoutes from "../components/auth/PublicRoutes";
import Login from "./Login";
import Accession from "./protected/books/Accession";
import Author from "./protected/books/Author";
import BookAdd from "./protected/books/BookAdd";
import Dashboard from "./protected/Dashboard";
import Category from "./protected/books/Category";
import Publisher from "./protected/books/Publisher";
import Sof from "./protected/books/Sof";
const pages = createRoutesFromChildren(
  <>
    <Route element={<ProtectedRoutes />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/books/create" element={<BookAdd />} />
      <Route path="/books/accession" element={<Accession />} />
      <Route path="/books/authors" element={<Author />} />
      <Route path="/books/categories" element={<Category />} />
      <Route path="/books/publishers" element={<Publisher />} />
      <Route path="/books/source-of-funds" element={<Sof />} />
    </Route>
    <Route element={<PublicRoutes restricted={true} />}>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Route>
  </>
);

export default pages;
