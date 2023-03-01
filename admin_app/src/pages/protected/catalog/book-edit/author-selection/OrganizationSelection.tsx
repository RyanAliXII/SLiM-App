import axiosClient from "@definitions/configs/axios";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { Organization } from "@definitions/types";

import { useMemo } from "react";
import { useBookEditFormContext } from "../BookEditFormContext";
const OrganizationSelection = () => {
  const { setForm, form } = useBookEditFormContext();
  const fetchOrganizations = async () => {
    try {
      const { data: response } = await axiosClient.get(
        "/authors/organizations"
      );

      return response?.data?.organizations || [];
    } catch {
      return [];
    }
  };
  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
  });
  const selectAuthor = (author: Organization) => {
    setForm((prevForm) => ({
      ...prevForm,
      authors: {
        ...prevForm.authors,
        organizations: [...prevForm.authors.organizations, author],
      },
    }));
  };
  const removeAuthor = (author: Organization) => {
    setForm((prevForm) => ({
      ...prevForm,
      authors: {
        ...prevForm.authors,
        organizations: prevForm.authors.organizations.filter(
          (org) => org.id != author.id
        ),
      },
    }));
  };

  const selectedCache = useMemo(
    () =>
      form.authors.organizations.reduce<Object>(
        (a, author) => ({
          ...a,
          [author.id ?? ""]: author,
        }),
        {}
      ),
    [form.authors.organizations]
  );
  return (
    <Table className="w-full border-b-0">
      <Thead>
        <HeadingRow>
          <Th>Organization</Th>
        </HeadingRow>
      </Thead>
      <Tbody>
        {organizations?.map((org) => {
          const isChecked = org.id
            ? selectedCache.hasOwnProperty(org.id)
            : false;
          return (
            <BodyRow
              key={org.id}
              className="cursor-pointer"
              onClick={() => {
                if (!isChecked) {
                  selectAuthor(org);
                  return;
                }
                removeAuthor(org);
              }}
            >
              <Td>
                <input
                  type="checkbox"
                  readOnly
                  className="h-4 w-4 border"
                  checked={isChecked}
                />
              </Td>
              <Td>{org.name}</Td>
            </BodyRow>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default OrganizationSelection;
