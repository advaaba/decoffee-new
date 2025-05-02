import React from "react";
import { Tabs } from "expo-router";
import TabBar from "../../components/TabBar";

export default function Layout() {
  return (
    <>
      {/* <ToastManager /> */}
      <Tabs tabBar={(props) => <TabBar {...props} />}>
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
          }}
        />
        <Tabs.Screen
          name="home-screen"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
        <Tabs.Screen
          name="coffee"
          options={{
            title: "Coffee",
          }}
        />
      </Tabs>
    </>
  );
}
