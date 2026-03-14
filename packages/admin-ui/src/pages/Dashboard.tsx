import React, { useState } from 'react';
import {Header} from "../components/Header.tsx";

export const Dashboard: React.FC = () => {
  return (
    <div>
        <Header strictAuth={true}/>
        Dashboard
    </div>
  );
};