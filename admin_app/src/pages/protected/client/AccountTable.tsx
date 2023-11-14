import { Account } from "@definitions/types";
import { Avatar, Checkbox, Table } from "flowbite-react";
import React, { ChangeEvent, useMemo, useState } from "react";

type AccountTableProps = {
  accounts: Account[];
};
const AccountTable: React.FC<AccountTableProps> = ({ accounts }) => {
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const selectedAccountIdsCache = useMemo<Map<string, string>>(() => {
    const map = new Map<string, string>();
    for (const accountId of selectedAccountIds) {
      map.set(accountId, accountId);
    }
    return map;
  }, [selectedAccountIds]);

  const handleAccountSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    const accountId = event.target.value;
    if (isChecked) {
      setSelectedAccountIds((prevSelected) => [...prevSelected, accountId]);
    }
    setSelectedAccountIds((prevSelected) =>
      prevSelected.filter((selectedId) => selectedId != accountId)
    );
  };
  return (
    <Table>
      <Table.Head>
        <Table.HeadCell></Table.HeadCell>
        <Table.HeadCell></Table.HeadCell>
        <Table.HeadCell>User</Table.HeadCell>
        <Table.HeadCell>Email</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y dark:divide-gray-700">
        {accounts?.map((account) => {
          const url = new URL(
            "https://ui-avatars.com/api/&background=2563EB&color=fff"
          );
          url.searchParams.set(
            "name",
            `${account.givenName} ${account.surname}`
          );
          return (
            <Table.Row key={account.id}>
              <Table.Cell>
                <Checkbox
                  checked={selectedAccountIdsCache.has(account.id ?? "")}
                  color="primary"
                  onChange={handleAccountSelect}
                  value={account.id}
                ></Checkbox>
              </Table.Cell>
              <Table.Cell>
                <div className="h-10">
                  <Avatar img={url.toString()} rounded></Avatar>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {account.givenName.length + account.surname.length === 0
                    ? "Unnamed"
                    : `${account.givenName} ${account.surname}`}
                </div>
                <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {account.displayName}
                </div>
              </Table.Cell>
              <Table.Cell>{account.email}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default AccountTable;
