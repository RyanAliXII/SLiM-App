import {
  LightOutlineButton,
  PrimaryButton,
} from "@components/ui/button/Button";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import Divider from "@components/ui/divider/Divider";
import { Input } from "@components/ui/form/Input";
import {
  HeadingRow,
  Table,
  Tbody,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { ModalProps, Module, Role } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";
import { remove } from "lodash";
import React, { BaseSyntheticEvent, MouseEventHandler, useMemo } from "react";

import Modal from "react-responsive-modal";

const AccessControlPage = () => {
  const {
    isOpen: isAddModalOpen,
    close: closeAddModal,
    open: openAddModal,
  } = useSwitch();

  return (
    <>
      <ContainerNoBackground>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-700">Access Control</h1>
          <PrimaryButton onClick={openAddModal}>Create Role</PrimaryButton>
        </div>
      </ContainerNoBackground>
      <Container>
        <Table>
          <Thead>
            <HeadingRow>
              <Th>Roles</Th>
            </HeadingRow>
          </Thead>
          <Tbody></Tbody>
        </Table>
      </Container>
      <AddRoleModal
        isOpen={isAddModalOpen}
        closeModal={closeAddModal}
      ></AddRoleModal>
    </>
  );
};

const AddRoleModal = ({ closeModal, isOpen }: ModalProps) => {
  const { Get } = useRequest();
  const { form, handleFormInput, setForm } = useForm<Role>({
    initialFormData: {
      name: "",
      permissions: {},
    },
  });

  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    console.log(form);
  };
  const fetchPermissions = async () => {
    try {
      const { data: response } = await Get("/system/modules");
      return response?.data?.modules ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const { data: modules } = useQuery<Module[]>({
    queryKey: ["modules"],
    queryFn: fetchPermissions,
  });

  const selectedPermissionCache: Record<string, Object> = useMemo(
    () =>
      Object.keys(form.permissions).reduce<Record<string, Object>>(
        (prev, key) => {
          const permissionObj = form.permissions[key].reduce<Object>(
            (a, permission) => ({ ...a, [permission]: true }),
            {}
          );
          return { ...prev, [key]: permissionObj };
        },
        {}
      ),
    [form.permissions]
  );

  const handleSelect = (module: string, permission: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      permissions: {
        ...prevForm.permissions,
        [module]: [...(prevForm.permissions[module] ?? []), permission],
      },
    }));
  };
  const handleRemove = (module: string, permission: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      permissions: {
        ...prevForm.permissions,
        [module]: prevForm.permissions[module].filter((p) => p != permission),
      },
    }));
  };

  if (!isOpen) return null;
  return (
    <Modal
      center
      onClose={closeModal}
      open={isOpen}
      showCloseIcon={false}
      styles={{
        modal: {
          maxHeight: "500px",
        },
      }}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-11/12 rounded" }}
    >
      <form onSubmit={submit}>
        <div className="w-full mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-semibold">Create role</h1>
          </div>
          <Input
            type="text"
            name="name"
            onChange={handleFormInput}
            label="Role name"
            placeholder="e.g Librarian, Assistant Librarian, Staff"
          ></Input>

          <div>
            <h2 className="text-lg py-2 font-semibold ml-1">Access Control</h2>
            {modules?.map((module) => {
              return (
                <div key={module.name} className="px-2">
                  <div className="py-2">{module.displayText}</div>
                  <Divider></Divider>
                  <ul className="list-none px-1 ">
                    {module.permissions.map((p) => {
                      let isChecked = false;
                      const selectedModule = selectedPermissionCache[
                        module.name
                      ] as Record<string, string>;
                      if (selectedModule) {
                        isChecked = selectedModule[p.name] ? true : false;
                      }

                      return (
                        <React.Fragment key={p.name}>
                          <li
                            className="grid grid-cols-3 px-1 py-1 cursor-pointer"
                            onClick={() => {
                              if (isChecked) {
                                handleRemove(module.name, p.name);
                                return;
                              }
                              handleSelect(module.name, p.name);
                            }}
                          >
                            <div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                readOnly={true}
                                className="h-8 flex items-center"
                              ></input>
                            </div>
                            <div className="text-sm flex items-center">
                              {p.name}
                            </div>
                            <div className="text-sm flex items-center">
                              {p.description}
                            </div>
                          </li>
                          <Divider />
                        </React.Fragment>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mt-5">
            <PrimaryButton>Create role</PrimaryButton>
            <LightOutlineButton
              type="button"
              onClick={() => {
                closeModal();
              }}
            >
              Cancel
            </LightOutlineButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AccessControlPage;
