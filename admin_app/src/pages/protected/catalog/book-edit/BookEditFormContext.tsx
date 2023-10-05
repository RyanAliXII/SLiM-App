import { BaseProps } from "@definitions/props.definition";
import { Book } from "@definitions/types";
import { useForm, UseFormType } from "@hooks/useForm";
import React, { createContext, useContext } from "react";
import { UpdateBookSchemaValidation } from "../schema";
import { format } from "date-fns";

export const BookEditFormContext = createContext({} as BookAddContextType);
interface BookAddContextType extends UseFormType<Book> {}
export const useBookEditFormContext = () => {
  return useContext(BookEditFormContext);
};

const INITIAL_FORM_DATA: Book = {
  title: "",
  isbn: "",
  authors: [],
  copies: 1,
  subject: "",
  sourceOfFund: "",
  section: {
    name: "Select section.",
    id: 0,
    prefix: "",
    hasOwnAccession: false,
  },
  publisher: {
    name: "Select publisher.",
    id: "",
  },

  receivedAt: format(new Date(), "yyyy-MM-dd"),
  authorNumber: "",
  ddc: "",
  costPrice: 0,
  description: "",

  edition: 0,
  pages: 1,

  yearPublished: new Date().getFullYear(),
  accessions: [],
  covers: [],
  searchTags: [],
};

export const BookEditFormProvider: React.FC<BaseProps> = ({ children }) => {
  const formClient = useForm<Book>({
    initialFormData: INITIAL_FORM_DATA,
    schema: UpdateBookSchemaValidation,
    scrollToError: true,
  });

  return (
    <BookEditFormContext.Provider
      value={{
        ...formClient,
      }}
    >
      {children}
    </BookEditFormContext.Provider>
  );
};
