import HasAccess from "@components/auth/HasAccess";
import Container from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { Section, Tree } from "@definitions/types";
import { useDeleteCollection } from "@hooks/data-fetching/collection";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "flowbite-react";
import { useState } from "react";
import "react-responsive-modal/styles.css";
import { toast } from "react-toastify";
import AddSectionModal from "./AddSectionModal";
import EditSectionModal from "./EditSectionModal";
import CollectionTree from "./CollectionTree";
type Data = {
  collections: Section[];
  tree: Tree<number, Section>[];
};
const SectionPage = () => {
  const [section, setSection] = useState<Section>({
    isSubCollection: false,
    name: "",
    prefix: "",
    id: 0,
    isDeleteable: false,
    mainCollectionId: 0,
    accessionTable: "",
    isNonCirculating: false,
  });
  const {
    isOpen: isAddModalOpen,
    open: openAddModal,
    close: closeAddModal,
  } = useSwitch();

  const {
    isOpen: isEditModalOpen,
    open: openEditModal,
    close: closeEditModal,
  } = useSwitch();
  const { Get } = useRequest();
  const fetchSections = async () => {
    try {
      const { data: response } = await Get("/sections/", {});
      return {
        collections: response?.data?.sections ?? [],
        tree: response?.data?.tree ?? [],
      };
    } catch (error) {
      console.error(error);
      return {
        collections: [],
        tree: [],
      };
    }
  };

  const { data, isLoading, isError } = useQuery<Data, unknown, Data>({
    queryFn: fetchSections,
    queryKey: ["sections"],
  });
  const queryClient = useQueryClient();
  const initEdit = (section: Section) => {
    setSection(section);
    openEditModal();
  };

  const deleteConfirm = useSwitch();
  const initDelete = (section: Section) => {
    setSection(section);
    deleteConfirm.open();
  };
  const onConfirmDelete = () => {
    deleteCollection.mutate(section.id ?? 0);
    deleteConfirm.close();
  };
  const deleteCollection = useDeleteCollection({
    onSuccess: () => {
      toast.success("Collection deleted.");
      queryClient.invalidateQueries(["sections"]);
      queryClient.invalidateQueries(["sectionsMain"]);
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const tree: Tree<number, Section>[] = [
    {
      children: data?.tree ?? [],
      id: 0,
      name: "Collection Relationships",
      data: {
        id: 0,
        name: "Collection Relationships",
        isNonCirculating: true,
        isSubCollection: false,
        mainCollectionId: 0,
        prefix: "",
        lastValue: 0,
        isDeleteable: false,
        accessionTable: "",
      },
    },
  ];
  return (
    <>
      <Container>
        <div className="w-full flex justify-end pb-4 ">
          <HasAccess requiredPermissions={["Collection.Add"]}>
            <Button color="primary" onClick={openAddModal}>
              New Collection
            </Button>
          </HasAccess>
        </div>
        {tree.map((t) => {
          return <CollectionTree tree={t} key={t.id} />;
        })}
      </Container>

      <AddSectionModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
      <EditSectionModal
        formData={section}
        isOpen={isEditModalOpen}
        closeModal={closeEditModal}
      />
      <DangerConfirmDialog
        title="Delete Collection"
        text="Are you sure you want to delete collection?"
        close={deleteConfirm.close}
        isOpen={deleteConfirm.isOpen}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default SectionPage;
