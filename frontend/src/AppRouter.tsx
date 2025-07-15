import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { PurchaseOrderListPage } from "./pages/PurchaseOrderListPage";
import { PurchaseOrderFormPage } from "./pages/PurchaseOrderFormPage";
import { GLAccountListPage } from "./pages/GLAccountListPage";

// Wrapper component for PurchaseOrderListPage with layout
const PurchaseOrderListWithLayout: React.FC = () => (
  <AppLayout
    pageTitle="Purchase Orders"
    pageSubtitle="Manage and track all purchase orders"
    breadcrumb={[{ title: "Purchase Orders", path: "/purchase-orders" }]}
  >
    <PurchaseOrderListPage />
  </AppLayout>
);

// Wrapper component for PurchaseOrderFormPage with layout
const PurchaseOrderFormWithLayout: React.FC = () => {
  const { id } = useParams();
  const isNew = !id || id === "new";

  return (
    <AppLayout
      pageTitle={isNew ? "Create Purchase Order" : "Edit Purchase Order"}
      pageSubtitle={
        isNew ? "Create a new purchase order" : `Edit purchase order`
      }
      breadcrumb={[
        { title: "Purchase Orders", path: "/purchase-orders" },
        { title: isNew ? "Create New" : `Edit` },
      ]}
    >
      <PurchaseOrderFormPage
        onNavigateToList={() => (window.location.href = "/purchase-orders")}
      />
    </AppLayout>
  );
};

const GLAccountListWithLayout: React.FC = () => (
  <AppLayout
    pageTitle="GL Accounts"
    pageSubtitle="Manage and track all GL accounts"
    breadcrumb={[{ title: "GL Accounts", path: "/gl-accounts" }]}
  >
    <GLAccountListPage />
  </AppLayout>
);

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/purchase-orders"
        element={<PurchaseOrderListWithLayout />}
      />
      <Route
        path="/purchase-orders/:id"
        element={<PurchaseOrderFormWithLayout />}
      />
      <Route path="/gl-accounts" element={<GLAccountListWithLayout />} />
      <Route path="/" element={<Navigate to="/purchase-orders" replace />} />
    </Routes>
  );
};
