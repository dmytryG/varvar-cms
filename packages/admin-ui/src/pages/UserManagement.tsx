import React, { useState } from 'react';
import {Header} from "../components/Header.tsx";
import {PageWithSideMenu} from "../components/PageWithSideMenu.tsx";

export const UserManagement: React.FC = () => {
  return (
    <div>
        <Header strictAuth={true} toDashIfLoggedIn={false}/>
        <PageWithSideMenu>
            <div>Dashboard</div>
        </PageWithSideMenu>
    </div>
  );
};