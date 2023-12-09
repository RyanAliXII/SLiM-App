import { Device, DeviceLog } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useNewDevice = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, Omit<Device, "id">, unknown>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/devices`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useDevices = ({
  onSuccess,
  onError,
  onSettled,
}: UseQueryOptions<Device[]>) => {
  const { Get } = useRequest();

  const fetchDevices = async () => {
    try {
      const { data: response } = await Get("/devices", {
        params: {},
      });

      const { data } = response;
      return data?.devices ?? [];
    } catch {
      return [];
    }
  };
  return useQuery<Device[]>({
    queryFn: fetchDevices,
    onSuccess: onSuccess,
    onError: onError,
    queryKey: ["devices"],
    onSettled,
  });
};

export const useEditDevice = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, Device, unknown>) => {
  const { Put } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Put(`/devices/${form.id}`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
export const useDeleteDevice = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<any, unknown, string, unknown>) => {
  const { Delete } = useRequest();
  return useMutation({
    mutationFn: (bookId) =>
      Delete(`/devices/${bookId}`, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};

export const useDeviceLog = ({
  onSuccess,
  onSettled,
  onError,
}: MutationOptions<
  any,
  unknown,
  Omit<DeviceLog, "id" | "client" | "device" | "createdAt">,
  unknown
>) => {
  const { Post } = useRequest();
  return useMutation({
    mutationFn: (form) =>
      Post(`/devices/logs`, form, {
        headers: {
          "content-type": "application/json",
        },
      }),
    onSuccess: onSuccess,
    onError: onError,
    onSettled: onSettled,
  });
};
