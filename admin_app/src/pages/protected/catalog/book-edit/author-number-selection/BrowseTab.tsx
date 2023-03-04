import { AuthorNumber } from "@definitions/types";
import { useState } from "react";

import { Input } from "@components/ui/form/Input";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";

import useDebounce from "@hooks/useDebounce";
import useScrollWatcher from "@hooks/useScrollWatcher";
import { useBookEditFormContext } from "../BookEditFormContext";
import { useRequest } from "@hooks/useRequest";

type BrowseTabProps = {
  modalRef: React.RefObject<HTMLDivElement>;
};
const BrowseTab = ({ modalRef }: BrowseTabProps) => {
  const { Get } = useRequest();
  const OFFSET_INCREMENT = 50;
  const { form, setFieldValue, removeFieldError } = useBookEditFormContext();
  const [searchKeyword, setKeyword] = useState("");
  const fetchCuttersTable = async ({ pageParam = 0 }) => {
    try {
      const { data: response } = await Get(`/author-numbers/`, {
        params: {
          offset: pageParam,
          keyword: searchKeyword,
        },
      });
      return response.data.table ?? [];
    } catch (error) {
      return [];
    }
  };
  const queryClient = useQueryClient();
  const search = () => {
    queryClient.setQueryData(["authorNumbers"], () => {
      return {
        pageParams: [],
        pages: [],
      };
    });
    refetch();
  };
  const { data, fetchNextPage, refetch } = useInfiniteQuery<AuthorNumber[]>({
    queryFn: fetchCuttersTable,
    queryKey: ["authorNumbers"],
    refetchOnWindowFocus: false,
    getNextPageParam: (_, allPages) => {
      return allPages.length * OFFSET_INCREMENT;
    },
  });
  const debounceSearch = useDebounce();

  useScrollWatcher({
    element: modalRef.current,
    onScrollEnd: () => {
      fetchNextPage();
    },
  });
  const selectAuthorNumber = (authorNumber: AuthorNumber) => {
    setFieldValue(
      "authorNumber",
      `${authorNumber.surname.charAt(0)}${authorNumber.number}`
    );
    removeFieldError("authorNumber");
  };

  return (
    <div>
      <div className="flex gap-2 items-center mb-3">
        <div>
          <Input
            label="Author Number"
            wrapperclass="flex items-center"
            className="disabled:bg-gray-100"
            type="text"
            readOnly
            disabled
            value={form.authorNumber}
          />
        </div>
        <Input
          wrapperclass="flex items-end h-14 mt-1"
          onChange={(event) => {
            setKeyword(event.target.value);
            debounceSearch(search, {}, 300);
          }}
          type="text"
          placeholder="Search..."
        ></Input>
      </div>

      <Table>
        <Thead>
          <HeadingRow>
            {/* <Th></Th> */}
            <Th>Surname</Th>
            <Th>Number</Th>
          </HeadingRow>
        </Thead>

        <Tbody>
          {data?.pages.map((authorNumbers) => {
            return authorNumbers?.map((authorNumber, index) => {
              return (
                <BodyRow
                  key={authorNumber.surname}
                  onClick={() => {
                    selectAuthorNumber(authorNumber);
                  }}
                  className="cursor-pointer"
                >
                  {/* <Td>
                    <Input
                      wrapperclass="flex items-center"
                      type="checkbox"
                      className="h-4"
                      readOnly
                    ></Input>
                  </Td> */}
                  <Td>{authorNumber.surname}</Td>
                  <Td>{authorNumber.number}</Td>
                </BodyRow>
              );
            });
          })}
        </Tbody>
      </Table>
    </div>
  );
};

export default BrowseTab;
