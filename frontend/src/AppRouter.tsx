import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PurchaseOrderListPage } from "./pages/PurchaseOrderListPage";
import { PurchaseOrderFormPage } from "./pages/PurchaseOrderFormPage";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/purchase-orders"
        element={
            <PurchaseOrderListPage />
        }
      />
      <Route
        path="/purchase-orders/:id"
        element={
            <PurchaseOrderFormPage />
        }
      />

      <Route path="/" element={<Navigate to="/purchase-orders" replace />} />

      <Route path="*" element={<Navigate to="/purchase-orders" replace />} />
    </Routes>
  );
};
