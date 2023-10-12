import { LighButton, PrimaryButton } from "@components/ui/button/Button";
import { Input } from "@components/ui/form/Input";

import { Author, ModalProps, PersonAuthor } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { BaseSyntheticEvent, useEffect } from "react";
import { toast } from "react-toastify";
import { CreateAuthorSchema } from "../schema";
import Modal from "react-responsive-modal";
import { EDIT_AUTHOR_INITIAL_FORM } from "./AuthorPage";
import { useRequest } from "@hooks/useRequest";

interface EditModalProps<T> extends ModalProps {
  formData: T;
}
const EditAuthorPersonModal: React.FC<EditModalProps<Author>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const { form, errors, removeErrors, setForm, validate, handleFormInput } =
    useForm<Author>({
      initialFormData: EDIT_AUTHOR_INITIAL_FORM,
      schema: CreateAuthorSchema,
    });
  useEffect(() => {
    setForm(() => {
      return { ...formData };
    });
  }, [formData]);
  useEffect(() => {
    if (!isOpen) {
      removeErrors();
    }
  }, [isOpen]);

  const queryClient = useQueryClient();
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      await validate();
      mutation.mutate();
    } catch (error) {
      console.error(error);
    }
  };
  const { Put } = useRequest();
  const mutation = useMutation({
    mutationFn: () => Put(`/authors/${formData.id}/`, form, {}),
    onSuccess: () => {
      toast.success("Author has been updated.");
      queryClient.invalidateQueries(["authors"]);
    },
    onError: (error) => {
      toast.error(ErrorMsg.Delete);
      console.error(error);
    },
    onSettled: () => {
      closeModal();
    },
  });
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      showCloseIcon={false}
      center
    >
      <form onSubmit={submit}>
        <div className="w-full h-48 mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">Edit Author</h1>
          </div>
          <div className="px-2 mb-2">
            <Input
              label="name"
              error={errors?.name}
              type="text"
              name="name"
              onChange={handleFormInput}
              value={form.name}
            />
          </div>
          <div className="flex gap-1 p-2">
            <PrimaryButton>Update author</PrimaryButton>
            <LighButton onClick={closeModal} type="button">
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};
export default EditAuthorPersonModal;
