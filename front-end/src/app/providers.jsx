import { QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "../context/AppContext";
import { AuthProvider } from "../features/auth/model/auth-provider";
import { queryClient } from "./query-client";
import { FeedbackProvider } from "../shared/ui/feedback-provider";
import { LocaleProvider } from "../i18n/locale-context";

export const AppProviders = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <LocaleProvider>
      <AuthProvider>
        <FeedbackProvider>
          <AppProvider>{children}</AppProvider>
        </FeedbackProvider>
      </AuthProvider>
    </LocaleProvider>
  </QueryClientProvider>
);
