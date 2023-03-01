import { LighButton, PrimaryButton } from "@components/ui/button/Button";
import { Input } from "@components/ui/form/Input";
import axiosClient from "@definitions/configs/axios";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseSyntheticEvent } from "react";
import Modal from "react-responsive-modal";
import { toast } from "react-toastify";
import { CreateAuthorSchema } from "../../schema";
import { Author, ModalProps } from "@definitions/types";
import { ADD_AUTHOR_INITIAL_FORM } from "../AuthorPage";

const AddAuthorPersonModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { form, errors, validate, handleFormInput, resetForm } = useForm<
    Omit<Author, "id">
  >({
    initialFormData: ADD_AUTHOR_INITIAL_FORM,
    schema: CreateAuthorSchema,
  });
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

  const mutation = useMutation({
    mutationFn: () => axiosClient.post("/authors/", form),
    onSuccess: () => {
      toast.success("New author has been added.");
      queryClient.invalidateQueries(["authors"]);
    },
    onError: (error) => {
      toast.error(ErrorMsg.New);
      console.error(error);
    },
    onSettled: () => {
      closeModal();
      resetForm();
    },
  });

  if (!isOpen) return null; //; temporary fix for react-responsive-modal bug

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      showCloseIcon={false}
      center
    >
      <form onSubmit={submit}>
        <div className="w-full h-96">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">New Author</h1>
          </div>
          <div className="px-2 mb-2">
            <Input
              label="Given name"
              error={errors?.givenName}
              type="text"
              name="givenName"
              onChange={handleFormInput}
              value={form.givenName}
            />
          </div>
          <div className="px-2 mb-2">
            <Input
              label="Middle name/initial"
              error={errors?.middleName}
              type="text"
              name="middleName"
              onChange={handleFormInput}
              value={form.middleName}
            />
          </div>
          <div className="px-2 mb-2">
            <Input
              label="Surname"
              error={errors?.surname}
              type="text"
              name="surname"
              onChange={handleFormInput}
              value={form.surname}
            />
          </div>
          <div className="flex gap-1 p-2">
            <PrimaryButton>Add author</PrimaryButton>
            <LighButton type="button" onClick={closeModal}>
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddAuthorPersonModal;
