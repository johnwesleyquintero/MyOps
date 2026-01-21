import React, { ReactNode } from "react";
import { ConfigProvider } from "./ConfigProvider";
import { NotificationProvider } from "./NotificationProvider";
import { UiProvider } from "./UiProvider";
import { DataProvider } from "./DataProvider";

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <ConfigProvider>
      <NotificationProvider>
        <UiProvider>
          <DataProvider>{children}</DataProvider>
        </UiProvider>
      </NotificationProvider>
    </ConfigProvider>
  );
};
