import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChatMessages,
  saveChatMessage,
  clearChatMessages,
  queryKeys,
  type ChatMessage,
} from "@/lib/storage";

/**
 * Query hook to get chat messages between two users
 */
export function useChatMessages(currentUserId: string | null, matchUserId: string | null) {
  return useQuery({
    queryKey: queryKeys.chat.conversation(currentUserId ?? "", matchUserId ?? ""),
    queryFn: () => getChatMessages(currentUserId!, matchUserId!),
    enabled: !!currentUserId && !!matchUserId,
  });
}

type SaveMessageParams = {
  currentUserId: string;
  matchUserId: string;
  message: {
    sender: "user" | "match";
    text: string;
  };
};

/**
 * Mutation hook to save a chat message
 */
export function useSaveChatMessage() {
  const queryClient = useQueryClient();

  return useMutation<ChatMessage, Error, SaveMessageParams>({
    mutationFn: ({ currentUserId, matchUserId, message }) => {
      const savedMessage = saveChatMessage(currentUserId, matchUserId, message);
      return Promise.resolve(savedMessage);
    },
    onSuccess: (_, variables) => {
      // Invalidate the chat cache for this conversation
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversation(
          variables.currentUserId,
          variables.matchUserId
        ),
      });
    },
  });
}

type ClearChatParams = {
  currentUserId: string;
  matchUserId: string;
};

/**
 * Mutation hook to clear chat history
 */
export function useClearChatMessages() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ClearChatParams>({
    mutationFn: ({ currentUserId, matchUserId }) => {
      clearChatMessages(currentUserId, matchUserId);
      return Promise.resolve();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversation(
          variables.currentUserId,
          variables.matchUserId
        ),
      });
    },
  });
}

export type { ChatMessage };

