import { Book, BorrowedCopy, BorrowingTransaction } from "./types";

export const BookInitialValue: Book = {
  title: "",
  isbn: "",
  authors: [],
  section: {
    name: "",
    id: 0,
    hasOwnAccession: false,
  },
  publisher: {
    name: "",
    id: 0,
  },

  covers: [],
  copies: 1,
  receivedAt: new Date().toISOString(),
  authorNumber: "",
  ddc: "",

  description: "",

  edition: 0,
  pages: 1,

  yearPublished: new Date().getFullYear(),
  accessions: [],
};

export const BorrowedCopyInitialValue: BorrowedCopy = {
  book: BookInitialValue,
  isReturned: false,
  bookId: "",
  copyNumber: 0,
  number: 0,
  returnedAt: "",
  isAvailable: false,
};

export const BorrowingTransactionInitialValue: BorrowingTransaction = {
  client: {
    metaData: {
      totalPenalty: 0,
      onlineApprovedBooks: 0,
      onlineCancelledBooks: 0,
      onlineCheckedOutBooks: 0,
      onlinePendingBooks: 0,
      onlineReturnedBooks: 0,
      walkInCheckedOutBooks: 0,
      walkInReturnedBooks: 0,
    },
    displayName: "",
    email: "",
    givenName: "",
    surname: "",
    id: "",
  },
  borrowedCopies: [],
  createdAt: "",
  dueDate: "",
  returnedAt: "",
  remarks: "",
  isReturned: false,
};
