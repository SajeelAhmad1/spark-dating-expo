// src/features/user/hooks.ts 
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProfile, updateProfile } from "./api";
import { queryClient } from "../../lib/queryClient";

export const useUserProfileQuery = () => {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: getProfile,
  });
};

export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationFn: updateProfile,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["user", "profile"] });

      const previous = queryClient.getQueryData(["user", "profile"]);

      queryClient.setQueryData(["user", "profile"], (old: any) => ({
        ...old,
        ...newData,
      }));

      return { previous };
    },
    onError: (_err, _newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["user", "profile"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
};