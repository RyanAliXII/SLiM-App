import { Input, InputClasses } from "@components/ui/form/Input";
import {
  Th,
  Thead,
  Table,
  HeadingRow,
  Tbody,
  Td,
  BodyRow,
} from "@components/ui/table/Table";
import { ModalProps, DDC } from "@definitions/types";
import Modal from "react-responsive-modal";
import { useBookAddFormContext } from "./BookAddFormContext";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";
import { toast } from "react-toastify";

import ReactPaginate from "react-paginate";
import usePaginate from "@hooks/usePaginate";

const DDCSelectionModal: React.FC<ModalProps> = ({ closeModal, isOpen }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  if (!isOpen) return null;
  return (
    <Modal
      ref={modalRef}
      onClose={closeModal}
      open={isOpen}
      closeIcon
      center
      styles={{
        modal: {
          maxWidth: "none",
        },
      }}
      classNames={{
        modalContainer: "",
        modal: "w-11/12 lg:w-9/12 rounded h-[600px]",
      }}
    >
      <DDCTable modalRef={modalRef} />
    </Modal>
  );
};

enum SearchBy {
  Name = "name",
  Number = "number",
}
type DDCTableProps = {
  modalRef: React.RefObject<HTMLDivElement>;
};
const DDCTable = ({ modalRef }: DDCTableProps) => {
  const { form, setForm, removeFieldError } = useBookAddFormContext();
  const searchDebounce = useDebounce();

  const queryClient = useQueryClient();

  const search = () => {};
  const { Get } = useRequest();
  const fetchDDC = async ({ pageParam = 0 }) => {
    try {
      const { data: response } = await Get("/ddc/", {
        params: {
          page: currentPage,
        },
      });

      return response?.data?.ddc ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const {
    currentPage,
    setCurrentPage,
    setTotalPages,
    totalPages,
    previousPage,
  } = usePaginate({
    initialPage: 1,
    numberOfPages: 0,
  });
  const { data: ddc } = useQuery<DDC[]>({
    queryFn: fetchDDC,
    queryKey: ["ddc", currentPage],
    refetchOnWindowFocus: false,
  });

  const selectDDC = (ddc: DDC) => {
    setForm((prevForm) => ({ ...prevForm, ddc: ddc.number }));
    removeFieldError("ddc");
    toast.info(`${ddc.name} has been selected as classification.`);
  };
  return (
    <>
      <div className="flex gap-2 items-center mb-3">
        <Input
          wrapperclass="flex items-end h-14 mt-1"
          name="keyword"
          type="text"
          placeholder="Search..."
        ></Input>
      </div>
      <Table>
        <Thead>
          <HeadingRow>
            <Th></Th>
            <Th>Class name</Th>
            <Th>Number</Th>
          </HeadingRow>
        </Thead>

        <Tbody>
          {ddc?.map((d) => {
            return (
              <BodyRow
                key={d.id}
                onClick={() => {
                  selectDDC(d);
                }}
                className="cursor-pointer"
              >
                <Td>
                  <Input
                    wrapperclass="flex items-center"
                    type="checkbox"
                    checked={form.ddc === d.number}
                    className="h-4"
                    readOnly
                  ></Input>
                </Td>
                <Td>{d.name}</Td>
                <Td>{d.number}</Td>
              </BodyRow>
            );
          })}
        </Tbody>
      </Table>

      <ReactPaginate
        nextLabel="Next"
        pageLinkClassName="border px-3 py-0.5  text-center rounded"
        pageRangeDisplayed={3}
        pageCount={10}
        disabledClassName="opacity-60 pointer-events-none"
        onPageChange={({ selected }) => {
          setCurrentPage(selected + 1);
        }}
        className="flex gap-2 items-center"
        previousLabel="Previous"
        previousClassName="px-2 border text-gray-500 py-1 rounded"
        nextClassName="px-2 border text-blue-500 py-1 rounded"
        renderOnZeroPageCount={null}
        activeClassName="border-none bg-blue-500 text-white rounded"
      />
    </>
  );
};

export default DDCSelectionModal;
